// This file is required before test runs. 
// When required, it sets up the test framework to test against the src files (JIT compiling them in runtime)

// @ts-ignore
process.env.BABEL_ENV = 'test-src'

// @ts-ignore
require.main.require('@babel/register')({ extensions: ['.js', '.ts']})
