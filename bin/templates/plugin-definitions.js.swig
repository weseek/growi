/*
 * !! don't commit this file !!
 * !!      just revert       !!
 */
export const definitions = [
  {% for definition in definitions %}{
    name: '{{ definition.name }}',
    meta: require('{{ definition.name }}'),
    entries: [
      {% for entryPath in definition.entries %}
      require('{{ entryPath }}'),
      {% endfor %}
    ]
  },
  {% endfor %}

]
