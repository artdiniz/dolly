import { resolvePathFromCwd } from 'resolvePathFromCwd'

process.on('unhandledRejection', (error, rejectedPromise) => {
  console.error('Unhandled Rejection at:', rejectedPromise, 'reason:', error)
  process.exit(1)
})

const argsDir = resolvePathFromCwd(process.argv.slice(2)[0])

console.log('Gerando apostila em: ')
console.log(argsDir)
