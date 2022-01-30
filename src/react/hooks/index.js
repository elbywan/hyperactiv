import dependencies from './dependencies.js'

export function setHooksDependencies({ wretch, normaliz }) {
    if(wretch) dependencies.references.wretch = wretch
    if(normaliz) dependencies.references.normaliz = normaliz
}

export * from './useNormalizedRequest.js'
export * from './useRequest.js'
export * from './useResource.js'
export * from './context.js'
