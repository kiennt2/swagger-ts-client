"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const settings_1 = require("../settings");
const typeNameInfo_1 = require("../type/typeNameInfo");
const nonLitralRegx = /[^_$a-zA-Z0-9\xA0-\uFFFF]/g;
class Operation {
    constructor(httpVerb, url, swOpr, typeManager) {
        this.httpVerb = httpVerb;
        this.url = url;
        this.swOpr = swOpr;
        this.typeManager = typeManager;
        this.importedTypes = [];
        this.operationName = settings_1.settings.operations.operationsNameTransformFn(url, httpVerb, swOpr);
        this.groupName = settings_1.settings.operations.operationsGroupNameTransformFn(url, httpVerb, swOpr);
        this.build();
    }
    build() {
        this.responsesType = this.getResponse();        
        if (this.swOpr.parameters && this.swOpr.parameters.length) {
            this.operationParams = this.swOpr.parameters.map((p) => this.buildParam(p));
        }
    }
    getResponse() {

        if (this.swOpr.responses && this.swOpr.responses["200"] && this.swOpr.responses["200"].schema) {
            const retType = this.typeManager.getTypeNameInfo(this.swOpr.responses["200"].schema);
            if (!typeNameInfo_1.TypeNameInfo.isJsPrimitive(retType.fullTypeName)) {
                this.addImportedType(retType);
            }
            if(this.swOpr.responses["200"].schema['$ref'] && this.swOpr.responses["200"].schema['$ref'] !== '' && settings_1.settings.uppercaseFirstLetterOfRefType) {
                var responRef = retType.fullTypeName;
                return responRef.charAt(0).toUpperCase() + responRef.slice(1);
            } else {
                return retType.fullTypeName;
            }            
        }
        else {
            return "void";
        }
    }
    buildParam(param) {
        const paramType = this.typeManager.getTypeNameInfoParameter(param);
        this.addImportedType(paramType);
        var type = paramType.fullTypeName;
        if(param.schema && param.schema['$ref'] && param.schema['$ref'] !== '' && settings_1.settings.uppercaseFirstLetterOfRefType) {
            type = type.charAt(0).toUpperCase() + type.slice(1);
        }
        return {
            paramName: param.name,
            paramDisplayName: param.name.replace(nonLitralRegx, "_"),
            paramType: type,
            inBody: param.in === "body",
            inFormData: param.in === "formData",
            inPath: param.in === "path",
            inQuery: param.in === "query",
        };
    }
    addImportedType(typename) {
        this.importedTypes = this.importedTypes.concat(typename.getComposingTypeNames(true));
    }
}
exports.Operation = Operation;
