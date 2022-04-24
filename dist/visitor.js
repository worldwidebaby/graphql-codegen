"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MNTMGraphQLVisitor = void 0;
const graphql_1 = require("graphql");
const visitor_plugin_common_1 = require("@graphql-codegen/visitor-plugin-common");
const auto_bind_1 = __importDefault(require("auto-bind"));
const change_case_all_1 = require("change-case-all");
class MNTMGraphQLVisitor extends visitor_plugin_common_1.ClientSideBaseVisitor {
    constructor(schema, fragments, rawConfig) {
        super(schema, fragments, rawConfig, {
            withHooks: (0, visitor_plugin_common_1.getConfigValue)(rawConfig.withHooks, true),
            withRequests: (0, visitor_plugin_common_1.getConfigValue)(rawConfig.withRequests, false),
            withSWR: (0, visitor_plugin_common_1.getConfigValue)(rawConfig.withSWR, false)
        });
        this._resolveType = change_case_all_1.pascalCase;
        (0, auto_bind_1.default)(this);
        this._pureComment = rawConfig.pureMagicComment ? '/*#__PURE__*/' : '';
    }
    _gql(node) {
        const fragments = this._transformFragments(node);
        let doc = (0, graphql_1.print)(node);
        // Fix escaped
        doc = doc.replace(/\\\\/g, '\\\\');
        if (this.config.optimizeDocumentNode) {
            // Specification minify
            doc = (0, graphql_1.stripIgnoredCharacters)(doc);
            // Fix unnecessary space around doc
            doc = doc.trim();
        }
        // Add fragments
        doc += this._includeFragments(fragments, node.kind);
        // Finalize
        doc = this._prepareDocument(doc);
        return `\`${doc}\``;
    }
    getImports() {
        const imports = super.getImports();
        const hasOperations = this._collectedOperations.length > 0;
        if (!hasOperations) {
            return imports;
        }
        const importNames = [];
        if (this.config.withHooks) {
            importNames.push('useQuery');
            importNames.push('useLazyQuery');
        }
        if (this.config.withRequests || this.config.withSWR) {
            importNames.push('gqlRequest');
        }
        if (importNames.length > 0) {
            imports.push(`import { ${importNames.join(', ')} } from '@mntm/graphql';`);
        }
        if (this.config.withSWR) {
            imports.push(`import type { BareFetcher, SWRConfiguration, SWRResponse } from 'swr';`);
            imports.push(`import { default as useSWR } from 'swr';`);
            imports.push(`type SWRDispatchResponse<D, E, V> = Omit<SWRResponse<D, E>, 'data'> & {
  data: D | null;
  dispatch: (variables?: V) => Promise<D>;
};`);
            imports.push(`const unstable_SWRDispatchCompare = ${this._pureComment}() => false;`);
            imports.push(`const unstable_SWRDispatchConfig = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnMount: false,
  revalidateOnReconnect: false,
  fallbackData: null,
  compare: unstable_SWRDispatchCompare
} as const;`);
            imports.push(`const unstable_useSWRDispatch = ${this._pureComment}<M, V>(bare: BareFetcher<M>, config: Partial<SWRConfiguration<M, Error, BareFetcher<M>>> = {}) => {
  const swr = useSWR<M, Error>({}, bare, Object.assign({}, unstable_SWRDispatchConfig, config)) as SWRDispatchResponse<M, Error, V>;

  swr.dispatch = async (variables: V = {} as V) => swr.mutate(bare(variables)) as Promise<M>;

  return swr;
};`);
        }
        return imports;
    }
    _resolveName(operationType, name) {
        return this.convertName(name || '', {
            suffix: this.config.omitOperationSuffix ? '' : operationType,
            useTypesPrefix: false
        });
    }
    _buildHooks(node, rawOperationType, documentVariableName, operationResultType, operationVariablesTypes) {
        var _a;
        const operationType = this._resolveType(rawOperationType);
        const operationName = this._resolveName(operationType, (_a = node.name) === null || _a === void 0 ? void 0 : _a.value);
        if (operationType === 'Mutation') {
            return `
export const use${operationName} = ${this._pureComment}() => {
  return useLazyQuery<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName});
};
`;
        }
        if (operationType === 'Query') {
            return `
export const use${operationName} = ${this._pureComment}(variables: ${operationVariablesTypes} = {} as ${operationVariablesTypes}) => {
  return useQuery<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName}, variables);
};
export const useLazy${operationName} = ${this._pureComment}() => {
  return useLazyQuery<${operationResultType}, ${operationVariablesTypes}>(${documentVariableName});
};
`;
        }
        throw new Error(`${operationType} is not yet supported`);
    }
    _buildRequests(node, rawOperationType, documentVariableName, operationResultType, operationVariablesTypes) {
        var _a;
        const operationType = this._resolveType(rawOperationType);
        const operationName = this._resolveName(operationType, (_a = node.name) === null || _a === void 0 ? void 0 : _a.value);
        if (operationType === 'Mutation' || operationType === 'Query') {
            return `
export const request${operationName} = ${this._pureComment}(variables: ${operationVariablesTypes} = {} as ${operationVariablesTypes}) => {
  return gqlRequest<${operationResultType}>(${documentVariableName}, variables);
};
`;
        }
        throw new Error(`${operationType} is not yet supported`);
    }
    _buildSWR(node, rawOperationType, documentVariableName, operationResultType, operationVariablesTypes) {
        var _a;
        const operationType = this._resolveType(rawOperationType);
        const operationName = this._resolveName(operationType, (_a = node.name) === null || _a === void 0 ? void 0 : _a.value);
        if (operationType === 'Query') {
            return `
const fetch${operationName} = ${this._pureComment}(doc: string, variables: ${operationVariablesTypes} = {} as ${operationVariablesTypes}) => {
  return gqlRequest<${operationResultType}>(doc, variables);
};
export const useSWR${operationName} = ${this._pureComment}(variables: ${operationVariablesTypes} = {} as ${operationVariablesTypes}, config: Partial<SWRConfiguration<${operationResultType}, Error, BareFetcher<${operationResultType}>>> = {}) => {
  return useSWR<${operationResultType}, Error>(variables === null ? null : [${documentVariableName}, variables], fetch${operationName}, config);
};
`;
        }
        if (operationType === 'Mutation') {
            return `
const fetch${operationName} = ${this._pureComment}(variables: ${operationVariablesTypes} = {} as ${operationVariablesTypes}) => {
  return gqlRequest<${operationResultType}>(${documentVariableName}, variables);
};
export const useSWR${operationName} = ${this._pureComment}(config: Partial<SWRConfiguration<${operationResultType}, Error, BareFetcher<${operationResultType}>>> = {}) => {
  return unstable_useSWRDispatch<${operationResultType}, ${operationVariablesTypes}>(fetch${operationName}, config);
};
`;
        }
        throw new Error(`${operationType} is not yet supported`);
    }
    buildOperation(node, documentVariableName, operationType, operationResultType, operationVariablesTypes) {
        let operation = '';
        if (this.config.withHooks) {
            operation += this._buildHooks(node, operationType, documentVariableName, operationResultType, operationVariablesTypes);
        }
        if (this.config.withRequests) {
            operation += this._buildRequests(node, operationType, documentVariableName, operationResultType, operationVariablesTypes);
        }
        if (this.config.withSWR) {
            operation += this._buildSWR(node, operationType, documentVariableName, operationResultType, operationVariablesTypes);
        }
        return operation;
    }
}
exports.MNTMGraphQLVisitor = MNTMGraphQLVisitor;
