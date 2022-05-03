import type {
  ClientSideBasePluginConfig,
  RawClientSideBasePluginConfig
} from '@graphql-codegen/visitor-plugin-common'

/**
 * @description [graphql-codegen](https://github.com/dotansimha/graphql-code-generator) plugin that generates hooks with TypeScript typings for [@mntm/graphql](https://github.com/maxi-team/graphql).
 */
export type MNTMGraphQLRawPluginConfig = {
  /**
   * @description Customized the output by enabling/disabling the generated requests.
   * @default false
   */
  withRequests?: boolean
  /**
   * @description Customized the output by enabling/disabling the generated React Hooks.
   * @default true
   */
  withHooks?: boolean
  /**
   * @description Customized the output by enabling/disabling the generated useSWR Hooks.
   * @default true
   */
  withSWR?: boolean
  /**
   * @description Experimental Suspense-for-Data-Fetching support
   * @default false
   * */
  suspense?: boolean
} & RawClientSideBasePluginConfig

export type MNTMGraphQLPluginConfig = {
  withRequests: boolean
  withHooks: boolean
  withSWR: boolean
  suspense: boolean
} & ClientSideBasePluginConfig
