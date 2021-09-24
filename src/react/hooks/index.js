import dependencies from './dependencies'

export function setHooksDependencies({ wretch, normaliz }) {
    if(wretch) dependencies.references.wretch = wretch
    if(normaliz) dependencies.references.normaliz = normaliz
}

export * from './useNormalizedRequest'
export * from './useRequest'
export * from './useResource'
export * from './context'
