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

  find = (id: number) =>
  {
    return this.model.findOne({ where: { id } });
  }

  /* only a single column/attribute of a model is updated, which is 
    denoted by the `property` parameter, and in which the `value` parameter
    is the value for that property */
  edit = (id: number, property: string, value: any) =>
  {
    return this.model.update({ [property]: value }, { where: { id } });
  }
  
  delete = (id: number) =>
  {
    return this.model.destroy({ where: { id } });
  }
}

export { Service };
