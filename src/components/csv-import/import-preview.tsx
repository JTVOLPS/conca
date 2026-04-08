"use client";

interface ImportPreviewProps {
  data: Record<string, string>[];
  mapping: Record<string, string>;
  maxRows?: number;
}

export function ImportPreview({
  data,
  mapping,
  maxRows = 5,
}: ImportPreviewProps) {
  const mappedEntries = Object.entries(mapping).filter(([, v]) => v);

  if (mappedEntries.length === 0) {
    return (
      <div className="rounded-md border p-6 text-center text-sm text-muted-foreground">
        Map at least one column to see a preview
      </div>
    );
  }

  const previewData = data.slice(0, maxRows);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">
        Preview ({Math.min(maxRows, data.length)} of {data.length} rows)
      </h3>
      <div className="rounded-md border overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              {mappedEntries.map(([csvCol, dbCol]) => (
                <th
                  key={csvCol}
                  className="h-9 px-3 text-left font-medium text-muted-foreground"
                >
                  {dbCol}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {previewData.map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                {mappedEntries.map(([csvCol]) => (
                  <td key={csvCol} className="px-3 py-2 truncate max-w-[200px]">
                    {row[csvCol] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
