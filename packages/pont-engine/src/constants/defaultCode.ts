export const defaultTemplateCode = `
import Pont from '@td-design/pont-engine';
import { CodeGenerator, Interface } from "@td-design/pont-engine";

export class FileStructures extends Pont.FileStructures {
}

export default class MyGenerator extends CodeGenerator {
}
`;

export const defaultTransformCode = `
import { StandardDataSource } from "@td-design/pont-engine";

export default function(dataSource: StandardDataSource): StandardDataSource {
  return dataSource;
}
`;

export const defaultFetchMethodCode = `
import fetch from 'node-fetch';

export default function (url: string): string {
  return fetch(url).then(res => res.text())
}
`;
