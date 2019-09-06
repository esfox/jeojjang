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

class UserMedia extends Model {}
class MediaTag extends Model {}

const models =
[
  { model: User, attributes: userAttributes },
  { model: Media, attributes: mediaAttributes },
  { model: Tag, attributes: tagAttributes },
  { model: UserMedia, },
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
  Media.belongsToMany(User, { through: UserMedia, foreignKey: 'user_id' });
  Tag.belongsToMany(UserMedia, { through: MediaTag, foreignKey: 'tag_id' });
  UserMedia.belongsTo(User, { as: 'user', foreignKey: 'user_id' });
  UserMedia.belongsTo(Media, { as: 'media', foreignKey: 'media_id' });
  UserMedia.belongsToMany(Tag, 
    { through: MediaTag, foreignKey: 'user_media_id' });
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
