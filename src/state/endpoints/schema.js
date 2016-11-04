const schema = {
  type: 'object',
  additionalProperties: false,
  patternProperties: {
    // ApiName
    '.': {
      type: 'object',
      additionalProperties: false,
      patternProperties: {
        // Version
        '.': {
          type: 'array',
          items: {
            type: 'object'
          }
        }
      }
    }
  }
};

export default schema;
