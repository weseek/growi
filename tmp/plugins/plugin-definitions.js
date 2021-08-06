/*
 * !! don't commit this file !!
 * !!      just revert       !!
 */
module.exports = [
  {
    name: 'growi-plugin-attachment-refs',
    meta: require('growi-plugin-attachment-refs'),
    entries: [
      
      require('growi-plugin-attachment-refs/src/client-entry.js').default,
      
    ]
  },
  {
    name: 'growi-plugin-lsx',
    meta: require('growi-plugin-lsx'),
    entries: [
      
      require('growi-plugin-lsx/src/client-entry.js').default,
      
    ]
  },
  {
    name: 'growi-plugin-pukiwiki-like-linker',
    meta: require('growi-plugin-pukiwiki-like-linker'),
    entries: [
      
      require('growi-plugin-pukiwiki-like-linker/src/client-entry.js').default,
      
    ]
  },
  

]
