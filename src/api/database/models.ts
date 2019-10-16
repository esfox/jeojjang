import { Sequelize, Model, DataTypes } from 'sequelize';

class User extends Model
{
  public id: number;
  // TODO: Change to Snowflake type
  public discord_id: string;

  public static columns =
  {
    id: 'id',
    discord_id: 'discord_id',
  }
}
// const userAttributes =
// {
//   discord_id: DataTypes.STRING
// };

class Media extends Model
{
  public id: number;
  public link: string;
  public createdAt: Date;

  public static columns =
  {
    id: 'id',
    link: 'link',
    createdAt: 'createdAt',
  }
}
// const mediaAttributes =
// {
//   link: DataTypes.STRING
// };

class Tag extends Model
{
  public id: number;
  public name: string;

  public static columns =
  {
    id: 'id',
    name: 'name',
  }
}
// const tagAttributes =
// {
//   name: DataTypes.STRING
// };

class UserMedia extends Model
{
  public id: number;
  public media_id: number;
  public user_id: number;
  public tags?: string;

  public user?: User;
  public media?: Media;
  // public tags?: Tag[];

  public static columns =
  {
    id: 'id',
    media_id: 'media_id',
    user_id: 'user_id',
    tags: 'tags',
    createdAt: 'createdAt',
  }
}
// const userMediaAttributes = 
// {
//   id:
//   {
//     type: DataTypes.INTEGER,
//     primaryKey: true,
//     autoIncrement: true
//   },
//   tags: DataTypes.STRING,
// };

// class MediaTag extends Model {}

// const models =
// [
//   { model: User, attributes: userAttributes },
//   { model: Media, attributes: mediaAttributes },
//   { model: Tag, attributes: tagAttributes },
//   { model: UserMedia, attributes: userMediaAttributes },
//   // { model: MediaTag, },
// ];

function initializeModels(sequelize: Sequelize)
{
  const initOptions =
  {
    sequelize,
    underscored: true,
  };

  User.init({ discord_id: DataTypes.STRING }, initOptions);
  Media.init({ link: DataTypes.STRING }, initOptions);
  Tag.init({ name: DataTypes.STRING }, initOptions);
  UserMedia.init(
  {
    id:
    {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    tags: DataTypes.STRING,
  }, initOptions);
  
  // for(const { model, attributes } of models)
  //   model.init(attributes || {},
  //   {
  //     sequelize,
  //     underscored: true,
  //   });

  associateModels();
}

function associateModels()
{
  Media.belongsToMany(User, 
    { through: UserMedia, foreignKey: 'media_id', as: 'user' });
  User.belongsToMany(Media,
    { through: UserMedia, foreignKey: 'user_id', as: 'media' });

  UserMedia.belongsTo(User, { foreignKey: 'user_id', as: 'user' });
  UserMedia.belongsTo(Media, { foreignKey: 'media_id', as: 'media' });

  // Tag.belongsToMany(UserMedia,
  //   { through: MediaTag, foreignKey: 'tag_id', as: 'userMedia' });
  // UserMedia.belongsToMany(Tag, 
  //   { through: MediaTag, foreignKey: 'user_media_id', as: 'tags' });
}

export {
  initializeModels,
  User, 
  Media,
  Tag, 
  UserMedia,
  // MediaTag
};
