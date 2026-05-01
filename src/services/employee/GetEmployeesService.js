import * as employeeRepository from "../../repositories/EmployeeRepository.js";

class GetEmployeesService {
    async execute(page = 1, per_page = 10, scopedBranchId = null) {
        const skip = (page - 1) * per_page;
        const [total_items, data] = await Promise.all([
            employeeRepository.countActiveEmployees(scopedBranchId),
            employeeRepository.getAllActiveEmployees(skip, per_page, scopedBranchId),
        ]);

        return {
            page,
            per_page,
            total_items,
            total_pages: Math.ceil(total_items / per_page),
            data,
        };
    }
}

export default new GetEmployeesService();
