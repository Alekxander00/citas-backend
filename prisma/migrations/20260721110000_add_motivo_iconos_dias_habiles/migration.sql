-- PostgreSQL requires a newly added enum value to be committed before it can be used.
ALTER TYPE "DiaSemana" ADD VALUE IF NOT EXISTS 'DOMINGO';
