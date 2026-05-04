from fastapi import APIRouter, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

router = APIRouter(prefix="/phone", tags=["phone"])

REGION_CODES = frozenset({"us", "ca", "uk", "au", "eu"})


class RegionRecord(BaseModel):
    code: str
    label: str
    allowed_countries: list[str]
    line: dict[str, str] | None


REGIONS: dict[str, RegionRecord] = {
    "us": RegionRecord(
        code="us",
        label="United States",
        allowed_countries=["US"],
        line={
            "e164": "+16506740193",
            "display": "(650) 674-0193",
        },
    ),
    "ca": RegionRecord(
        code="ca",
        label="Canada",
        allowed_countries=["CA"],
        line=None,
    ),
    "uk": RegionRecord(
        code="uk",
        label="United Kingdom",
        allowed_countries=["GB"],
        line=None,
    ),
    "au": RegionRecord(
        code="au",
        label="Australia",
        allowed_countries=["AU"],
        line=None,
    ),
    "eu": RegionRecord(
        code="eu",
        label="European Union",
        allowed_countries=[
            "AT",
            "BE",
            "BG",
            "HR",
            "CY",
            "CZ",
            "DK",
            "EE",
            "FI",
            "FR",
            "DE",
            "GR",
            "HU",
            "IE",
            "IT",
            "LV",
            "LT",
            "LU",
            "MT",
            "NL",
            "PL",
            "PT",
            "RO",
            "SK",
            "SI",
            "ES",
            "SE",
        ],
        line=None,
    ),
}


def get_client_country(req: Request) -> str | None:
    for key in ("x-vercel-ip-country", "cf-ipcountry", "CloudFront-Viewer-Country"):
        v = req.headers.get(key)
        if v and v.strip():
            return v.strip().upper()
    return None


def public_region_list():
    return [
        {
            "code": r.code,
            "label": r.label,
            "available": r.line is not None,
        }
        for r in REGIONS.values()
    ]


@router.get("")
def regions_list() -> dict:
    return {"regions": public_region_list()}


class PhonePost(BaseModel):
    region: str | None = None


@router.post("")
def reveal(req: Request, body: PhonePost) -> dict:
    from app.config import get_settings

    settings = get_settings()

    regions_public = public_region_list()

    region_code = body.region or ""
    if region_code not in REGION_CODES:
        return JSONResponse(
            status_code=400,
            content={
                "status": "invalid_region",
                "regions": regions_public,
            },
        )

    region = REGIONS[region_code]
    detected = get_client_country(req)

    dev_mode = settings.environment == "development"

    if region.line is None:
        return {
            "status": "coming_soon",
            "region": {"code": region.code, "label": region.label},
            "detectedCountry": detected,
        }

    if detected is None:
        ip_allowed = dev_mode
    else:
        ip_allowed = detected in region.allowed_countries

    if not ip_allowed:
        return {
            "status": "region_mismatch",
            "region": {"code": region.code, "label": region.label},
            "detectedCountry": detected,
        }

    line = region.line
    e164 = line["e164"]
    display = line["display"]
    return {
        "status": "revealed",
        "region": {"code": region.code, "label": region.label},
        "detectedCountry": detected,
        "number": {
            "e164": e164,
            "display": display,
            "href": f"sms:{e164}",
        },
    }
