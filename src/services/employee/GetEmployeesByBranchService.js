import * as employeeRepository from "../../repositories/EmployeeRepository.js";

class GetEmployeesByBranchService {
    async execute(branchId, page = 1, per_page = 10) {
        const skip = (page - 1) * per_page;
        const [total_items, data] = await Promise.all([
            employeeRepository.countActiveEmployees(branchId),
            employeeRepository.getAllActiveEmployees(skip, per_page, branchId),
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

export default new GetEmployeesByBranchService();
