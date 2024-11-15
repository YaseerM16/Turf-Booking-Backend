"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoute = void 0;
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../../app/controllers/UserController");
const MongoUserRepository_1 = require("../../infrastructure/database/MongoUserRepository");
const UserUseCases_1 = require("../../domain/useCases/UserUseCases");
UserUseCases_1.UserUseCase;
const router = express_1.default.Router();
exports.userRoute = router;
const userRepository = new MongoUserRepository_1.MongoUserRepository();
const userUseCase = new UserUseCases_1.UserUseCase(userRepository);
const userController = new UserController_1.UserController(userUseCase);
router.post("/signup", (req, res) => userController.registersUser(req, res));
