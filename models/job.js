"use strict";

const db = require("../db");
const { NotFoundError} = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");


// Functions for Job class - one to many with companies //

class Job {

    // Create a new job from data //
    // Update db and return job data //
    // Insert Data ; { title, salary, equity, company Handle } (companyHandle = reference to company ) //
    // Return Data: { id, title, salary, equity, companyHandle } //

    static async create(data) {
        const result = await db.query(
            `INSERT INTO jobs (title,
                                salary,
                                equity,
                                company_handle)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, salary, equity, company_handle AS "companyHandle"`,
            [
            data.title,
            data.salary,
            data.equity,
            data.companyHandle,
            ]);
        let job = result.rows[0];

        return job;
    }

    // FIND all jobs - Filters Oprional //
    // Search Filters:  minSalary, hasEquity, title //  
    // Data provided as args: empty object for none, object { minSalary, hasEquity, title } for search  //
    // Returns: List of job objects //

    static async findAll({ minSalary, hasEquity, title } = {}) {
        let query = `SELECT j.id,
                            j.title,
                            j.salary,
                            j.equity,
                            j.company_handle AS "companyHandle",
                            c.name AS "companyName"
                    FROM jobs j 
                    LEFT JOIN companies AS c ON c.handle = j.company_handle`;
        let whereClauses = [];
        let queryValues = [];

        if (minSalary !== undefined) {
        queryValues.push(minSalary);
        whereClauses.push(`salary >= $${queryValues.length}`);
        }

        if (hasEquity === true) {
        whereClauses.push(`equity > 0`);
        }

        if (title !== undefined) {
        queryValues.push(`%${title}%`);
        whereClauses.push(`title ILIKE $${queryValues.length}`);
        }

        if (whereClauses.length > 0) {
        query += " WHERE " + whereClauses.join(" AND ");
        }

        // Finalize query and return results

        query += " ORDER BY title";
        const jobsRes = await db.query(query, queryValues);
        return jobsRes.rows;
    }

    // FIND job by ID //
    // Return job object { id, title, salary, equity, companyHandle, company } //
    // and related company object //
    static async get(id) {
        const jobRes = await db.query(
            `SELECT id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"
            FROM jobs
            WHERE id = $1`, [id]);

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        const companiesRes = await db.query(
            `SELECT handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"
            FROM companies
            WHERE handle = $1`, [job.companyHandle]);

        delete job.companyHandle;
        job.company = companiesRes.rows[0];

        return job;
    }

    // UPDATE job data //
    // Updates { title, salary, equity },  all fields or partial fields //
    // RETURNS update job object { id, title, salary, equity, companyHandle } //

    static async update(id, data) {
        const { setCols, values } = sqlForPartialUpdate(
            data,
            {});
        const idVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                        SET ${setCols} 
                        WHERE id = ${idVarIdx} 
                        RETURNING id, 
                                    title, 
                                    salary, 
                                    equity,
                                    company_handle AS "companyHandle"`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    // DELETE job by ID //
    // RETURNS undefined or NotFoundError // 
    static async remove(id) {
        const result = await db.query(
            `DELETE
            FROM jobs
            WHERE id = $1
            RETURNING id`, [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}

module.exports = Job;
