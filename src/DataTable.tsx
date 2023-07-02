import { useState, useEffect } from "react";
import { DataProvider } from "./DataContext";
import Table from "./Table";
import Footer from "./Footer";
import { useCSVParser } from "./useCSVParser";
import { dataToCSV } from "./functions";
import { useImmer } from "use-immer";
import FileSaver from "file-saver";

export interface DataSource {
  file: string | File;
  name: string;
  title: string;
}

export const DataTable = ({
  dataSrc
}: {
  dataSrc: DataSource;
}): JSX.Element => {
  const parsedResult = useCSVParser(dataSrc.file);

  const [data, updateData] = useImmer<string[][]>([]);
  const [headers, setHeaders] = useState<string[]>([]);

  useEffect(() => {
    if (!parsedResult.loading) {
      updateData(parsedResult.data);
      setHeaders(parsedResult.headerColumns);
    }
  }, [parsedResult]);

  const onDataChange = (
    newValue: string,
    rowIndex: number,
    headerKey: string
  ) => {
    updateData((draft) => {
      draft[rowIndex][headerKey] = newValue;
    });
  };

  const onDownload = () => {
    FileSaver.saveAs(
      "data:text/csv;charset=UTF-8," + encodeURIComponent(dataToCSV(data)),
      "export.csv"
    );
  };

  let content = (
    <div style={{ height: "100%", textAlign: "center", padding: 50 }}>
      Loading...
    </div>
  );
  if (!parsedResult.loading) {
    content = (
      <Table headerFields={headers} data={data} onDataChange={onDataChange} />
    );
  }

  return (
    <DataProvider data={data} updateData={updateData} headers={headers}>
      {content}
      <Footer
        totalRows={data.length}
        totalColumns={headers.length}
        onDownload={onDownload}
      />
    </DataProvider>
  );
};

export default DataTable;
