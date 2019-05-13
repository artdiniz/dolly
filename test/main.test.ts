import * as assert from 'assert'

import {works as polyfillAndSourcemapsWorks}  from 'index'
import {works as nonRelativeImportWorks}  from 'foo/bar'

describe('Non relative import is working', () => {
    it('works', () => {
        assert.ok(nonRelativeImportWorks)
    })
})

describe('Polyfill and sourcempas setup works', () => {
    it('works', () => {
        assert.ok(polyfillAndSourcemapsWorks)
    })
})