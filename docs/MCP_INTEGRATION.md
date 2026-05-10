# MCP Integration Guide for Rent Marketplace

## Overview

The Nanowork Rent marketplace enables AI agents to discover and access physical resources through the Model Context Protocol (MCP). This guide shows how to integrate physical resources with MCP servers so agents can seamlessly book and use them.

## Architecture

```
┌─────────────┐      MCP Protocol      ┌──────────────┐
│             │◄─────────────────────►│              │
│  AI Agent   │   Discovery/Booking    │  MCP Server  │
│  (Claude)   │                        │  (Resource)  │
│             │                        │              │
└─────────────┘                        └──────┬───────┘
                                              │
                                              │ Control
                                              ▼
                                       ┌──────────────┐
                                       │   Physical   │
                                       │   Resource   │
                                       │  (Hardware)  │
                                       └──────────────┘
```

## Resource Types & MCP Tools

### 1. Compute Resources (GPUs, Clusters)

**MCP Tools Required:**
- `list_available_slots` - Check compute availability
- `reserve_compute` - Reserve GPU/cluster time
- `get_access_credentials` - Retrieve SSH/API credentials
- `check_usage` - Monitor resource utilization
- `release_compute` - Release reservation early

**Example MCP Configuration:**

```json
{
  "mcpServers": {
    "nvidia-a100-gpu": {
      "command": "npx",
      "args": ["-y", "@nanowork/mcp-compute-server"],
      "env": {
        "NANOWORK_API_KEY": "nw_...",
        "RESOURCE_ID": "00000000-0000-0000-0000-000000000001"
      }
    }
  }
}
```

**Example Agent Usage:**

```
User: "I need to train a model that requires 80GB of GPU memory"

Agent thinks: 
- Calls list_available_slots for A100 GPUs (80GB)
- Finds slot available in 2 hours
- Calls reserve_compute with duration=4h
- Returns booking confirmation + SSH credentials
```

### 2. Lab Equipment (PCR, Sequencers, Microscopes)

**MCP Tools Required:**
- `check_equipment_status` - Availability and calibration status
- `book_session` - Reserve equipment time slot
- `upload_protocol` - Submit experimental protocol
- `start_run` - Initiate equipment operation
- `get_results` - Retrieve data files

**Example MCP Configuration:**

```json
{
  "mcpServers": {
    "pcr-machine": {
      "command": "npx",
      "args": ["-y", "@nanowork/mcp-lab-server"],
      "env": {
        "NANOWORK_API_KEY": "nw_...",
        "RESOURCE_ID": "00000000-0000-0000-0000-000000000006",
        "LAB_LOCATION": "san-francisco-ca"
      }
    }
  }
}
```

**Example Agent Usage:**

```
User: "Run PCR amplification with these primers: ATCG..."

Agent workflow:
1. Calls check_equipment_status for PCR machine
2. Calls book_session for next available slot
3. Calls upload_protocol with:
   - Template DNA concentration
   - Primer sequences
   - Annealing temperature
   - Cycle count
4. Calls start_run when session begins
5. Polls get_results until complete
6. Downloads amplification curves and results
```

### 3. Physical Spaces (Makerspaces, Kitchens, Studios)

**MCP Tools Required:**
- `check_availability` - View calendar availability
- `book_space` - Reserve time slot
- `request_materials` - Pre-order materials/supplies
- `get_access_code` - Door code or badge access
- `extend_booking` - Extend current session

**Example MCP Configuration:**

```json
{
  "mcpServers": {
    "makerspace-brooklyn": {
      "command": "npx",
      "args": ["-y", "@nanowork/mcp-space-server"],
      "env": {
        "NANOWORK_API_KEY": "nw_...",
        "RESOURCE_ID": "00000000-0000-0000-0000-000000000014",
        "SPACE_TYPE": "makerspace"
      }
    }
  }
}
```

**Example Agent Usage:**

```
User: "I need to laser cut 10 acrylic panels tomorrow afternoon"

Agent workflow:
1. Calls check_availability for makerspace (tomorrow, 2-6pm)
2. Calls request_materials for acrylic sheets (12"x12", 3mm)
3. Calls book_space for 3-hour slot
4. Returns booking confirmation with:
   - Access code: #5829
   - Materials ready on workbench #3
   - Laser cutter training video link
```

### 4. Human Services (Designers, Engineers, Consultants)

**MCP Tools Required:**
- `check_calendar` - View expert availability
- `book_consultation` - Schedule meeting/work session
- `share_project_brief` - Upload project requirements
- `get_deliverables` - Retrieve completed work
- `request_revision` - Request changes to work

**Example MCP Configuration:**

```json
{
  "mcpServers": {
    "cad-designer": {
      "command": "npx",
      "args": ["-y", "@nanowork/mcp-human-server"],
      "env": {
        "NANOWORK_API_KEY": "nw_...",
        "RESOURCE_ID": "00000000-0000-0000-0000-000000000021",
        "SERVICE_TYPE": "design"
      }
    }
  }
}
```

**Example Agent Usage:**

```
User: "Design an enclosure for my electronics project"

Agent workflow:
1. Calls check_calendar for CAD designer
2. Calls book_consultation for 1-hour slot
3. Calls share_project_brief with:
   - PCB dimensions
   - Port locations
   - Environmental requirements
   - Material preferences
4. Designer works on project
5. Calls get_deliverables to receive:
   - STEP files
   - Manufacturing drawings
   - BOM for hardware
```

## MCP Server Implementation

### Example: Compute Server

```typescript
// packages/mcp-compute-server/src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "nanowork-compute-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler("tools/list", async () => {
  return {
    tools: [
      {
        name: "list_available_slots",
        description: "Check compute resource availability",
        inputSchema: {
          type: "object",
          properties: {
            start_time: { type: "string", description: "ISO timestamp" },
            duration_hours: { type: "number" },
          },
          required: ["start_time", "duration_hours"],
        },
      },
      {
        name: "reserve_compute",
        description: "Reserve compute resources",
        inputSchema: {
          type: "object",
          properties: {
            slot_id: { type: "string" },
            duration_hours: { type: "number" },
            payment_method_id: { type: "string" },
          },
          required: ["slot_id", "duration_hours", "payment_method_id"],
        },
      },
      {
        name: "get_access_credentials",
        description: "Get SSH/API access credentials",
        inputSchema: {
          type: "object",
          properties: {
            booking_id: { type: "string" },
          },
          required: ["booking_id"],
        },
      },
    ],
  };
});

server.setRequestHandler("tools/call", async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case "list_available_slots": {
      const response = await fetch(
        `https://api.nanowork.app/api/rent/${process.env.RESOURCE_ID}/availability`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NANOWORK_API_KEY}`,
          },
        }
      );
      const data = await response.json();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(data, null, 2),
          },
        ],
      };
    }

    case "reserve_compute": {
      const response = await fetch(
        `https://api.nanowork.app/api/rent/${process.env.RESOURCE_ID}/book`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NANOWORK_API_KEY}`,
          },
          body: JSON.stringify({
            slot_id: args.slot_id,
            duration_hours: args.duration_hours,
            payment_method_id: args.payment_method_id,
          }),
        }
      );
      const booking = await response.json();
      return {
        content: [
          {
            type: "text",
            text: `Booking confirmed! ID: ${booking.id}\nStarts: ${booking.start_time}\nEnds: ${booking.end_time}`,
          },
        ],
      };
    }

    case "get_access_credentials": {
      const response = await fetch(
        `https://api.nanowork.app/api/rent/bookings/${args.booking_id}/credentials`,
        {
          headers: {
            Authorization: `Bearer ${process.env.NANOWORK_API_KEY}`,
          },
        }
      );
      const creds = await response.json();
      return {
        content: [
          {
            type: "text",
            text: `SSH: ssh ${creds.username}@${creds.host}\nPassword: ${creds.password}\nAPI Key: ${creds.api_key}`,
          },
        ],
      };
    }

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main();
```

## Setting Up Your Resource

### Step 1: Create Rent Item

```bash
curl -X POST https://api.nanowork.app/api/rent \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My GPU Server",
    "tagline": "H100 for AI training",
    "description": "8x H100 GPUs...",
    "category": "compute",
    "status": "preview",
    "price_preview": "$20/hour",
    "location": "Remote",
    "mcp_config": {
      "server_package": "@myorg/mcp-gpu-server",
      "env_vars": ["NANOWORK_API_KEY", "RESOURCE_ID"],
      "tools": ["list_available_slots", "reserve_compute", "get_access_credentials"]
    }
  }'
```

### Step 2: Implement MCP Server

Create an npm package implementing the MCP server interface with the tools listed in `mcp_config.tools`.

### Step 3: Publish MCP Server

```bash
cd packages/mcp-gpu-server
npm publish --access public
```

### Step 4: Test Integration

```json
// claude_desktop_config.json
{
  "mcpServers": {
    "my-gpu": {
      "command": "npx",
      "args": ["-y", "@myorg/mcp-gpu-server"],
      "env": {
        "NANOWORK_API_KEY": "nw_...",
        "RESOURCE_ID": "your-resource-id"
      }
    }
  }
}
```

## API Endpoints for Bookings

All MCP servers should interact with these Nanowork API endpoints:

### Check Availability
```
GET /api/rent/:id/availability?start=2026-05-10T14:00:00Z&duration_hours=4
```

### Create Booking
```
POST /api/rent/:id/book
{
  "slot_id": "slot-123",
  "duration_hours": 4,
  "payment_method_id": "pm_..."
}
```

### Get Booking Details
```
GET /api/rent/bookings/:booking_id
```

### Get Access Credentials
```
GET /api/rent/bookings/:booking_id/credentials
```

### Cancel Booking
```
DELETE /api/rent/bookings/:booking_id
```

### Extend Booking
```
PATCH /api/rent/bookings/:booking_id/extend
{
  "additional_hours": 2
}
```

## Security Considerations

1. **API Key Rotation** - MCP servers should support key rotation without downtime
2. **Access Control** - Verify booking ownership before providing credentials
3. **Time-Limited Credentials** - Generate ephemeral credentials that expire with booking
4. **Audit Logging** - Log all MCP tool calls for security and billing
5. **Rate Limiting** - Prevent abuse of booking APIs

## Best Practices

1. **Clear Error Messages** - Return actionable errors when bookings fail
2. **Availability Caching** - Cache availability checks for 30-60 seconds
3. **Webhook Notifications** - Send webhooks when sessions start/end
4. **Grace Periods** - Allow 5-10 minute grace period for late access
5. **Automatic Cleanup** - Release resources automatically when sessions end

## Example: Full Agent Workflow

```
User: "I need to train a ResNet model on ImageNet"

Agent (Claude with MCP):
1. Analyzes: "ResNet + ImageNet = needs ~40GB GPU, 8-12 hours"
2. Calls list_available_slots on A100 server
3. Finds slot tomorrow 2am-12pm
4. Calls reserve_compute with payment method
5. Receives booking confirmation
6. Calls get_access_credentials
7. Returns to user:
   "Booked A100 GPU tomorrow 2am-12pm ($30)
    SSH: ssh user@gpu-42.nanowork.app
    Ready to train! I can help set up the training script."
```

## Next Steps

- Implement booking API endpoints (see below)
- Create reference MCP servers for each category
- Build agent onboarding flow
- Add booking management dashboard
