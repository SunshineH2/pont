import * as fs from 'fs';
import * as path from 'path';
import type { Manager } from './Manager';
import { main } from './scan';
import { Interface } from './standard';

/** 入口方法 */
export async function clean(manager: Manager) {
  const unusedJsonPath = `./${manager.unusedJsonFileName}`;

  const suffix = manager.currConfig.templatePath === 'javaScript' ? 'js' : 'ts';

  const isExists = fs.existsSync(unusedJsonPath);

  if (isExists) {
    // 先读取到文件内容
    const unusedJsonData = JSON.parse(fs.readFileSync(unusedJsonPath, 'utf8')) as Interface[];

    unusedJsonData.forEach((ele) => {
      // 文件路径
      const paths = [manager.currConfig.outDir, ele.originName, 'mods', ele.modName, `${ele.name}.${suffix}`];

      // 最后一级是ts文件
      const currentFilePath = path.join(...paths);
      const existResult = fs.existsSync(currentFilePath);
      if (existResult) {
        fs.unlinkSync(currentFilePath);

        // 判断文件夹目录下是否只有一个index.ts文件
        const currentDirPath = path.join(...paths.slice(0, paths.length - 1));
        const dirData = fs.readdirSync(currentDirPath);
        // 说明只有一个index.ts文件了直接删除文件夹，否则重写index.ts
        if (dirData.length === 1) {
          fs.unlinkSync(path.join(...paths.slice(0, paths.length - 1), `index.${suffix}`));
          fs.rmdirSync(currentDirPath);

          // 此处还需要判断一下mods下的index.ts文件
          const currentModDirPath = path.join(...paths.slice(0, paths.length - 2));
          const modDirData = fs.readdirSync(currentModDirPath);
          const modDir = modDirData.filter((i) => i !== `index.${suffix}`);

          const modDirStr = modDir.map((i) => `import * as ${i} from './${i}';`).join('\n');
          const str = `${modDirStr}

export const ${ele.originName} = {
  ${modDir.join(', \n')}
}
          `;

          fs.writeFileSync(path.join(...paths.slice(0, paths.length - 2), `index.${suffix}`), str);
        } else {
          // 剔除掉index.ts文件
          const dirFiles = dirData.filter((i) => i !== `index.${suffix}`);

          const fileStr = dirFiles
            .map((item) => `import * as ${item.split('.')?.[0]} from './${item.split('.')?.[0]}';`)
            .join('\n');

          const totalStr = `${fileStr}

export {
  ${dirFiles.map((i) => i.split('.')?.[0]).join(', \n')}
}
          `;

          fs.writeFileSync(path.join(...paths.slice(0, paths.length - 1), `index.${suffix}`), totalStr);
        }
      }
    });

    fs.unlinkSync(unusedJsonPath);
  } else {
    main(manager);
    clean(manager);
  }
}
