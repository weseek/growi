{ type: 'root', children: [
    { type: 'leafGrowiPluginDirective',
    name: 'a', attributes: {}, children: [], position: { start: { line: 1, column: 1, offset: 0
        }, end: { line: 1, column: 3, offset: 2
        }
      }
    },
    { type: 'leafGrowiPluginDirective', name: 'a', attributes: {}, children: [
        { type: 'text', value: 'b', position: [Object
          ]
        }
      ], position: { start: { line: 3, column: 1, offset: 4
        }, end: { line: 3, column: 6, offset: 9
        }
      }
    },
    { type: 'leafGrowiPluginDirective', name: 'a', attributes: { b: ''
      }, children: [], position: { start: { line: 5, column: 1, offset: 11
        }, end: { line: 5, column: 6, offset: 16
        }
      }
    },
    { type: 'leafGrowiPluginDirective', name: 'a', attributes: { c: ''
      }, children: [
        { type: 'text', value: 'b', position: [Object
          ]
        }
      ], position: { start: { line: 7, column: 1, offset: 18
        }, end: { line: 7, column: 9, offset: 26
        }
      }
    },
    { type: 'leafGrowiPluginDirective', name: 'a', attributes: {}, children: [
        { type: 'text', value: 'b ', position: [Object
          ]
        },
        { type: 'emphasis', children: [Array
          ], position: [Object
          ]
        },
        { type: 'text', value: ' d ', position: [Object
          ]
        },
        { type: 'strong', children: [Array
          ], position: [Object
          ]
        }
      ], position: { start: { line: 9, column: 1, offset: 28
        }, end: { line: 9, column: 18, offset: 45
        }
      }
    },
    { type: 'leafGrowiPluginDirective', name: 'a', attributes: { id: 'e', class: 'c d f g', h: 'i & j k'
      }, children: [], position: { start: { line: 11, column: 1, offset: 47
        }, end: { line: 11, column: 44, offset: 90
        }
      }
    }
  ], position: { start: { line: 1, column: 1, offset: 0
    }, end: { line: 12, column: 1, offset: 91
    }
  }
}
