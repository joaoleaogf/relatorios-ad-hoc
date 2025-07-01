export type TableName = 'marca' | 'modelo' | 'veiculo' | 'ano';

export interface QueryInput {
  data: {
    from_principal: TableName;
    marca?: string[];
    modelo?: string[];
    veiculo?: string[];
    ano?: string[];
    conditions?: Record<string, any>;
    order?: {
      field: string;
      direction: 'ASC' | 'DESC' | string;
    };
  };
}
// ...existing code...