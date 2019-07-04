/*
 * !! don't commit this file !!
 * !!      just revert       !!
 */
module.exports = [
  {% for definition in definitions %}{
    name: '{{ definition.name }}',
    meta: require('{{ definition.name }}'),
    entries: [
      {% for entryPath in definition.entries %}
      require('{{ entryPath }}').default,
      {% endfor %}
    ]
  },
  {% endfor %}

]
