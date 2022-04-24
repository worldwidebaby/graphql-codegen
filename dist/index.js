"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MNTMGraphQLVisitor = exports.validate = exports.plugin = void 0;
const plugin_helpers_1 = require("@graphql-codegen/plugin-helpers");
const graphql_1 = require("graphql");
const visitor_1 = require("./visitor");
const path_1 = require("path");
const plugin = (schema, documents, config) => {
    const allAst = (0, graphql_1.concatAST)(documents.map((v) => v.document).filter((d) => !!d));
    const allFragments = [
        ...allAst.definitions.filter((d) => d.kind === graphql_1.Kind.FRAGMENT_DEFINITION).map((fragmentDef) => ({
            node: fragmentDef,
            name: fragmentDef.name.value,
            onType: fragmentDef.typeCondition.name.value,
            isExternal: false
        })),
        ...config.externalFragments || []
    ];
    const visitor = new visitor_1.MNTMGraphQLVisitor(schema, allFragments, config);
    const visitorResult = (0, plugin_helpers_1.oldVisit)(allAst, { leave: visitor });
    return {
        prepend: visitor.getImports(),
        content: [visitor.fragments, ...visitorResult.definitions.filter((t) => typeof t === 'string')].join('\n')
    };
};
exports.plugin = plugin;
const validate = (schema, documents, config, outputFile) => __awaiter(void 0, void 0, void 0, function* () {
    const ext = (0, path_1.extname)(outputFile);
    if (ext !== '.ts' && ext !== '.tsx') {
        throw new Error(`Plugin "@mntm/graphql-codegen" requires extension to be ".ts" or ".tsx"!`);
    }
    if (config.documentMode !== 'string') {
        throw new Error(`Plugin "@mntm/graphql-codegen" requires "documentMode: string"!`);
    }
});
exports.validate = validate;
// eslint-disable-next-line @typescript-eslint/no-duplicate-imports
var visitor_2 = require("./visitor");
Object.defineProperty(exports, "MNTMGraphQLVisitor", { enumerable: true, get: function () { return visitor_2.MNTMGraphQLVisitor; } });
