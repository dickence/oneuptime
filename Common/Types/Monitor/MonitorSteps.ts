import { FindOperator } from "typeorm";
import DatabaseProperty from "../Database/DatabaseProperty";
import { JSONArray, JSONObject } from "../JSON";
import MonitorCriteriaInstance from "./MonitorCriteriaInstance";
import BadDataException from "../Exception/BadDataException";


export interface MonitorStepsType {
    monitorStepsInstanceArray: Array<MonitorCriteriaInstance>;
}

export default class MonitorSteps extends DatabaseProperty { 
    public monitorSteps: MonitorStepsType | undefined = undefined;
    
    public constructor(){
        super();
    }

    public toJSON(): JSONObject {

        if(!this.monitorSteps){
            return {
                _type: "MonitorSteps",
                value: {}
            };
        }

        return {
            _type: "MonitorSteps",
            value: {
                monitorStepsInstanceArray: this.monitorSteps.monitorStepsInstanceArray.map((criteria) => criteria.toJSON())
            }
        }
    }

    public fromJSON(json: JSONObject): MonitorSteps {

        if(!json){
            throw new BadDataException("Invalid monitor steps");
        }

        if(!json['value']){
            throw new BadDataException("Invalid monitor steps");
        }
        
        if(!(json['value'] as JSONObject)['monitorStepsInstanceArray']){
            throw new BadDataException("Invalid monitor steps");
        }

        let monitorStepsInstanceArray: JSONArray = (json['value'] as JSONObject)['monitorStepsInstanceArray'] as JSONArray;


        this.monitorSteps = {
            monitorStepsInstanceArray:  monitorStepsInstanceArray.map((json: JSONObject) => new MonitorCriteriaInstance().fromJSON(json))
        }

        return this;
    }

    public static isValid(_json: JSONObject): boolean {
        return true;
    }

    protected static override toDatabase(
        _value: MonitorSteps | FindOperator<MonitorSteps>
    ): JSONObject | null {
        if (_value) {
            return (_value as MonitorSteps).toJSON();
        }

        return null;
    }

    protected static override fromDatabase(value: JSONObject): MonitorSteps | null {
        if (value) {
            return new MonitorSteps().fromJSON(value);
        }

        return null;
    }

    public override toString(): string {
        return JSON.stringify(this.toJSON());
    }
}