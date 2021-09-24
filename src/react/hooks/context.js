import { useContext } from 'react'
import { HyperactivContext } from '../context/index'

export function useStore() {
    const context = useContext(HyperactivContext)
    return context && context.store
}

export function useClient() {
    const context = useContext(HyperactivContext)
    return context && context.client
}
