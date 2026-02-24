import { listTablesDef, listTables } from './list_tables';
import { describeTableDef, describeTable } from './describe_table';
import { scanTableDef, scanTable } from './scan_table';
import { queryTableDef, queryTable } from './query_table';

// Tool definitions returned in the tools/list MCP response
export const TOOLS = [listTablesDef, describeTableDef, scanTableDef, queryTableDef];

// Registry used to dispatch tools/call requests
export const TOOL_HANDLERS: Record<string, (args: Record<string, any>) => Promise<any>> = {
  list_tables: listTables,
  describe_table: describeTable,
  scan_table: scanTable,
  query_table: queryTable,
};
