import { Model } from 'sequelize';

type ModelInstance = typeof Model & { new (values?: object): Model };

class Service
{
  public model: ModelInstance

  constructor(model: ModelInstance)
  {
    this.model = model;
  }

  getAll = () =>
  {
    return this.model.findAll();
  }

  findByID = (id: number) =>
  {
    return this.model.findOne({ where: { id } });
  }
}

export { Service };
