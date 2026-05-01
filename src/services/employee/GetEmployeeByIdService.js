import * as employeeRepository from "../../repositories/EmployeeRepository.js";

class GetEmployeeByIdService {
    async execute(id) {
        const employee = await employeeRepository.getEmployeeById(id);
        if (!employee) {
            throw new Error("Employee not found");
        }
        return employee;
    }
}

export default new GetEmployeeByIdService();
