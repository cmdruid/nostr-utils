/**
 *  Transformer
 *
 *  Type-safe implementation of a
 *  data pipe / transformer object.
 *
 * */

type TransformReturn<T, C> = (
  data    : T,
  context : C,
  err    ?: errorHandler
) => Promise<TransformOutput<T>>

type Method<T, C> = (
  input   : T,
  context : C
) => Promise<T | null | undefined> | T | null | undefined

type ReturnValue<T> = T | null | undefined

export type errorHandler = (...args : unknown[]) => void

export type TransformOutput<T> = [
  ok   : boolean,
  data : T,
  err  : unknown[]
]

export class Transformer<T, C> {
  public readonly context : C
  public readonly methods : Array<Method<T, C>>
  public catcher ?: errorHandler

  constructor (context : C) {
    this.context = context
    this.methods = []
    this.catcher = undefined
  }

  public use (...fn : Array<Method<T, C>>) : number {
    return this.methods.push(...fn)
  }

  public async apply (
    data    : T,
    context : C = this.context
  ) : Promise<TransformOutput<T>> {
    return pipe(...this.methods)(data, context, this.catcher)
  }

  public catch (catcher : errorHandler) : void {
    this.catcher = catcher
  }
}

export function pipe<T, C> (
  ...fns : Array<Method<T, C>>
) : TransformReturn<T, C> {
  /**
   * Transform an input by piping it through
   * various methods. Includes type-guarding
   * and flow control.
   */
  return async (
    input    : T,
    context  : C,
    catcher ?: errorHandler
  ) => {
    // Define our outer state.
    const err = []
    let curr = input, next : ReturnValue<T>
    // For each method in the stack,
    for (const fn of fns) {
      // Attempt to resolve the method.
      try {
        // Save return value from method.
        next = await fn(curr, context)
        if (next === null || next === undefined) {
          // If return value is fasly, then
          // close pipe with current value.
          return [ false, curr, err ]
        } else { curr = next }
      } catch (error) {
        // Something blew up.
        if (catcher !== undefined) {
          // Run error through the catcher.
          catcher(error, curr, context)
        }
        // If catcher didn't throw,
        // log error and continue.
        err.push(error)
      }
    }
    return [ err.length === 0, curr, err ]
  }
}
