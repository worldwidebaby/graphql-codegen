import type { PluginFunction, PluginValidateFn, Types } from '@graphql-codegen/plugin-helpers';
import type { MNTMGraphQLRawPluginConfig } from './config';
export declare const plugin: PluginFunction<MNTMGraphQLRawPluginConfig, Types.ComplexPluginOutput>;
export declare const validate: PluginValidateFn;
export { MNTMGraphQLVisitor } from './visitor';
