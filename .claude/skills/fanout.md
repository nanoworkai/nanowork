---
description: Continuously fan out work to parallel subagents until stopped
args: task description for subagents to work on
---

# Fanout - Continuous Parallel Subagent Execution

Spawn multiple subagents in parallel to work on a task continuously until the user types "exit", "stop", or "done".

## Arguments

The task description that each subagent should work on. This will be used as the prompt for spawned agents.

## Instructions

1. **Initial setup**
   - Parse the task description from args
   - Ask the user how many parallel agents to run (default: 3)
   - Confirm the task with the user before starting

2. **Main loop - run continuously until exit**
   - Spawn the specified number of agents in parallel, all running in background
   - Each agent gets the same task prompt with a unique iteration number
   - As each agent completes, immediately spawn a replacement agent with the next iteration number
   - Keep a running count of completed iterations
   - After every 5 completions, give a brief status update

3. **Agent configuration**
   - Use `subagent_type: "general-purpose"` for flexibility
   - Set `run_in_background: true` for all agents
   - Include iteration number in the description: "Fanout iteration #N: [task]"
   - Pass the full task as the prompt

4. **Exit conditions**
   - Monitor for user messages containing: "exit", "stop", "done", or "cancel"
   - When exit is detected, stop spawning new agents
   - Wait for currently running agents to complete
   - Provide final summary: total iterations completed, key findings if any

5. **Status reporting**
   - Keep output minimal during continuous operation
   - Report: iteration completions, any errors, exit confirmation
   - Avoid overwhelming the user with constant updates

## Example usage

```
/fanout search for TODO comments in the codebase and report their locations
/fanout review different parts of the API for security issues
/fanout explore the database schema and document table relationships
```

## Safety notes

- This will consume significant API resources by running multiple agents continuously
- The 7-day auto-expiry does NOT apply since this is an interactive skill, not a cron job
- User must actively type an exit command to stop
- Recommend starting with 2-3 parallel agents to avoid overwhelming the system
