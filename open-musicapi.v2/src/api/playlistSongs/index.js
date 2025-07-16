const PlaylistSongsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlistSongs',
  version: '1.0.0',
  register: async (server, {playlistSongsService, playlistsService, songsService, PlaylistSongsValidator}) => {
    const playlistSongsHandler = new PlaylistSongsHandler(
    playlistSongsService,
    playlistsService,
    songsService,
    PlaylistSongsValidator,
    );
    server.route(routes(playlistSongsHandler));
  },
};