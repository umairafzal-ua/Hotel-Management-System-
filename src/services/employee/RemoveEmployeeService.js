import * as employeeRepository from "../../repositories/EmployeeRepository.js";

class RemoveEmployeeService {
    async execute(id) {
        const deleted = await employeeRepository.removeEmployee(id);
        if (!deleted) {
            throw new Error("Employee not found");
        }
        return deleted;
    }
}

export default new RemoveEmployeeService();
