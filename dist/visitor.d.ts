import type { LoadedFragment } from '@graphql-codegen/visitor-plugin-common';
import type { FragmentDefinitionNode, GraphQLSchema, OperationDefinitionNode } from 'graphql';
import type { MNTMGraphQLPluginConfig, MNTMGraphQLRawPluginConfig } from './config';
import { ClientSideBaseVisitor } from '@graphql-codegen/visitor-plugin-common';
export declare class MNTMGraphQLVisitor extends ClientSideBaseVisitor<MNTMGraphQLRawPluginConfig, MNTMGraphQLPluginConfig> {
    private readonly _pureComment;
    constructor(schema: GraphQLSchema, fragments: LoadedFragment[], rawConfig: MNTMGraphQLRawPluginConfig);
    protected _gql(node: FragmentDefinitionNode | OperationDefinitionNode): string;
    getImports(): string[];
    private readonly _resolveType;
    private _resolveName;
    private _buildHooks;
    private _buildRequests;
    private _buildSWR;
    protected buildOperation(node: OperationDefinitionNode, documentVariableName: string, operationType: string, operationResultType: string, operationVariablesTypes: string): string;
}
