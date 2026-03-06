import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const MCP_URL = "https://mcp.data.gouv.fr/mcp";

let clientInstance: Client | null = null;

async function getClient(): Promise<Client> {
  if (clientInstance) return clientInstance;

  const client = new Client({ name: "vendezvite", version: "1.0.0" });
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL));

  client.onerror = (error) => {
    console.error("MCP transport error:", error);
    clientInstance = null;
  };
  client.onclose = () => {
    clientInstance = null;
  };

  await client.connect(transport);
  clientInstance = client;
  return client;
}

export async function callMCPTool(
  toolName: string,
  args: Record<string, unknown>
): Promise<string> {
  const client = await getClient();
  const result = await client.callTool({ name: toolName, arguments: args });

  const textContent = (
    result.content as Array<{ type: string; text?: string }>
  )
    .filter((c) => c.type === "text" && c.text)
    .map((c) => c.text!)
    .join("\n");

  return textContent;
}

export async function searchDatasets(query: string, pageSize: number = 10) {
  return callMCPTool("search_datasets", { query, page_size: pageSize });
}

export async function listDatasetResources(datasetId: string) {
  return callMCPTool("list_dataset_resources", { dataset_id: datasetId });
}

export async function queryResourceData(
  resourceId: string,
  question: string,
  pageSize: number = 200
) {
  return callMCPTool("query_resource_data", {
    resource_id: resourceId,
    question,
    page_size: pageSize,
  });
}

export async function getDatasetInfo(datasetId: string) {
  return callMCPTool("get_dataset_info", { dataset_id: datasetId });
}
