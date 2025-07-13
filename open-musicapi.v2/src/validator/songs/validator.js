const InvariantError = require('../../exceptions/InvariantError');
const { SongPayloadSchema } = require('./schema');

const SongsValidator = {
  validateSongPayload: (payload) => {
    const { error } = SongPayloadSchema.validate(payload, { abortEarly: false });
    if (error) {
      const messages = error.details.map((d) => d.message).join(', ');
      throw new InvariantError(messages);
    }
  },
};

module.exports = SongsValidator;