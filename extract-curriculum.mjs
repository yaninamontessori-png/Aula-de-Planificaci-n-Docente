import fs from "fs";
import path from "path";

const curriculumPath = "C:\\Users\\Pc\\Desktop\\primaria\\output\\diseno_curricular_santa_fe_md";
const result = {};

const gradeDirs = fs.readdirSync(curriculumPath).filter((f) =>
  fs.statSync(path.join(curriculumPath, f)).isDirectory() && /^\d{2}-/.test(f)
);

gradeDirs.sort().forEach((gradeDir) => {
  const gradeNum = parseInt(gradeDir.substring(0, 2));
  const gradeName = `${gradeNum}to grado`;
  const gradePath = path.join(curriculumPath, gradeDir);

  const areas = {};
  const areaDirs = fs.readdirSync(gradePath).filter((f) =>
    fs.statSync(path.join(gradePath, f)).isDirectory()
  );

  areaDirs.sort().forEach((areaDir) => {
    const areaPath = path.join(gradePath, areaDir);
    const areaNameFormatted = areaDir
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const contents = [];
    const mdFiles = fs.readdirSync(areaPath).filter((f) => f.endsWith(".md"));

    mdFiles.sort().forEach((mdFile) => {
      const contentName = mdFile
        .replace(".md", "")
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      contents.push({
        id: mdFile.replace(".md", ""),
        name: contentName,
      });
    });

    areas[areaDir] = {
      id: areaDir,
      name: areaNameFormatted,
      contents: contents,
    };
  });

  result[gradeName] = {
    grade: gradeNum,
    areas: areas,
  };
});

const outputPath = "C:\\Users\\Pc\\Desktop\\Yani\\planificar\\curriculum_santa_fe.json";
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
console.log(`✅ Archivo creado: ${outputPath}`);
console.log(`📊 Datos extraídos:`);
Object.entries(result).forEach(([grade, data]) => {
  console.log(`  ${grade}: ${Object.keys(data.areas).length} áreas`);
});
