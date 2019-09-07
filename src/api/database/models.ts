import { Sequelize, Model, DataTypes, ModelAttributes } from 'sequelize';

class User extends Model
{
  // TODO: Change to Snowflake type
  public discord_id: string;
}
const userAttributes: ModelAttributes =
{
  discord_id: DataTypes.STRING
};

class Media extends Model
{
  public link: string;
}
const mediaAttributes =
{
  link: DataTypes.STRING
};

class Tag extends Model
{
  public name: string;
}
const tagAttributes =
{
  name: DataTypes.STRING
};

class UserMedia extends Model
{
  public user?: User;
  public media?: Media;
  public tags?: Tag[];
}
const userMediaAttributes = 
{
  id:
  {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  }
}

class MediaTag extends Model {}

const models =
[
  { model: User, attributes: userAttributes },
  { model: Media, attributes: mediaAttributes },
  { model: Tag, attributes: tagAttributes },
  { model: UserMedia, attributes: userMediaAttributes },
  { model: MediaTag, },
];

function initializeModels(sequelize: Sequelize)
{
  for(const { model, attributes } of models)
    model.init(attributes || {},
    {
      sequelize,
      underscored: true,
    });

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

  Tag.belongsToMany(UserMedia,
    { through: MediaTag, foreignKey: 'tag_id' });
  UserMedia.belongsToMany(Tag, 
    { through: MediaTag, foreignKey: 'user_media_id', as: 'tags' });
}

export
{
  initializeModels,
  User, 
  Media,
  Tag, 
  UserMedia,
  MediaTag
};
