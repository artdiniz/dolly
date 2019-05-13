// This file is required before test runs. 
// When required, it sets up the test framework to test against compiled and distribution ready javascript code on package's dist folder

// @ts-ignore
process.env.BABEL_ENV = 'test-compiled'

// @ts-ignore
require.main.require('@babel/register')({extensions: ['.js', '.ts']})