require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentications = require('./api/authentications');
const playlists = require('./api/playlists');
const playlistSongs = require('./api/playlistSongs');
const collaborations = require('./collaborations');


const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistSongsService = require('./services/postgres/PlaylistSongsService');
const CollaborationsService = require('./collaborations/service');


const AlbumsValidator = require('./validator/albums/validator');
const SongsValidator = require('./validator/songs/validator');
const UsersValidator = require('./validator/users/validator');
const AuthenticationsValidator = require('./validator/authentications/validator');
const PlaylistsValidator = require('./validator/playlists/validator');
const PlaylistSongsValidator = require('./validator/playlistSongs/validator');
const CollaborationsValidator = require('./validator/collaborations/validator');


const ClientError = require('./exceptions/ClientError');
const TokenManager = require('./tokenize/TokenManager');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const collaborationsService = new CollaborationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const playlistSongsService = new PlaylistSongsService();

  const server = Hapi.server({
    port: process.env.PORT || 5000,
    host: process.env.HOST || 'localhost',
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  
  await server.register(Jwt);

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: playlistSongs,
      options: {
        playlistsService,
        playlistSongsService,
        validator: PlaylistSongsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
  ]);

  
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;

     if (response instanceof ClientError) {
    return h.response({
      status: 'fail',
      message: response.message,
    }).code(response.statusCode);
  }

  if (response.isBoom && response.isServer) {
    console.error('🔥 SERVER ERROR CAUGHT:', response);
    return h.response({
      status: 'error',
      message: 'Terjadi kegagalan pada server kami',
    }).code(500);
  }

    return h.continue;
  });

  await server.start();
  console.log(`🚀 Server berjalan pada ${server.info.uri}`);
};

init();