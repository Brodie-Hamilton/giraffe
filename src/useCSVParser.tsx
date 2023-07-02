import { useEffect, useState } from "react";
import Papa from "papaparse";

export interface ParseResult {
  loading: boolean;
  headerColumns: string[];
  data: string[][];
  errors: string[];
}

interface PapaParseResult {
  data: string[][];
  errors: { message: string }[];
  meta: { fields: string[] };
}

export const useCSVParser = (fileSrc: string | File): ParseResult => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<string[][]>([]);
  const [headerColumns, setHeaderColumns] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  useEffect(() => {
    setLoading(true);
    Papa.parse(fileSrc, {
      download: true,
      header: true,
      complete: function (result: PapaParseResult) {
        setLoading(false);
        setData(result.data);
        setHeaderColumns(result.meta.fields);
        setErrors(result.errors.map((error) => error.message));
      }
    });
  }, [fileSrc]);
  return { loading, headerColumns, data, errors };
};

export default useCSVParser;
