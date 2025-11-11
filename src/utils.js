import { writeFile } from "fs/promises";

export async function saveDataToFile(data, name, dir = ".") {
  const safeTag = name.replace(/[^\w-]/g, "");
  const filename = `${dir}/${safeTag}.json`;
  await writeFile(filename, JSON.stringify(data, null, 2), "utf8");
  return filename;
}

export const parseDate = (dateString) => {
  // Converts '20251107T070000.000Z' -> '2025-11-07T07:00:00.000Z'
  return new Date(
    dateString.replace(
      /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})\.(\d{3})Z$/,
      "$1-$2-$3T$4:$5:$6.$7Z"
    )
  );
};

export const saveAsCSV = async (data, name, dir = ".") => {
  const csvRows = [
    [
      "tag",
      "name",
      "score",
      "missedAttacks",
      "totalStars",
      "averageStars",
      "totalDestruction",
      "averageDestruction",
    ].join(","),
    ...data.map((player) =>
      [
        player.tag,
        player.name,
        player.score ?? 0,
        player.missedAttacks ?? 0,
        player.totalStars ?? 0,
        player.averageStars ?? 0,
        player.totalDestructionPercentage ?? 0,
        player.averageDestructionPercentage ?? 0,
      ]
        .map(csvEscape)
        .join(",")
    ),
  ];

  const csvString = csvRows.join("\n");
  await writeFile(`${dir}/${name}.csv`, csvString, "utf8");
  console.log(`CSV file saved as ${dir}/${name}.csv`);
};

const csvEscape = (field) => {
  if (
    typeof field === "string" &&
    (field.includes(",") || field.includes('"'))
  ) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
};
