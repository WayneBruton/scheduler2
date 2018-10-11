create database scheduler;
use scheduler;

create table users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(15) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL,
    password VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT NOW()
);

CREATE TABLE client_type (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_type_description VARCHAR(255) NOT NULL DEFAULT 'Single',
    client_rate DECIMAL(8,2) NOT NULL DEFAULT 0.0,
    rate_per_hour_day_month VARCHAR(100) NOT NULL DEFAULT 'Hourly',
    created_at TIMESTAMP DEFAULT NOW()
);

INSERT INTO client_type (client_type_description, client_rate, rate_per_hour_day_month) values
('Single', 35.88, 'Hourly'),
('CCP-12', 513.85, 'Daily' ),
('CCP-24', 742.64, 'Daily'),
('AIB', 42.82, 'Hourly'),
('Package', 27667.48, 'Monthly');

create table clients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name varchar(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150)  NOT NULL DEFAULT 'No Email',
    active BOOLEAN NOT NULL DEFAULT true,
    activity_reason VARCHAR(255),
    client_type INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY (client_type) REFERENCES client_type(id)
);



create table carers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name varchar(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL DEFAULT 'no email',
    rate_per_hour DECIMAL(8,2) NOT NULL DEFAULT 0.0, 
    employee_number VARCHAR(5) NOT NULL DEFAULT '00000',
    active BOOLEAN NOT NULL DEFAULT true,
    activity_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);








create table shifts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    client_id INT NOT NULL,
    carer_id INT NOT NULL,
    shift_month VARCHAR(7) NOT NULL,
    shift_start TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
    shift_end TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00',
    shift_type INT NOT NULL,
    shift_schedule_id VARCHAR(5) NOT NULL,
    time_sheets_processed BOOLEAN NOT NULL DEFAULT false,
    wage_file_processed BOOLEAN NOT NULL DEFAULT false,
    invoice_processed BOOLEAN NOT NULL DEFAULT false,
    payrollCode VARCHAR(3) NOT NULL DEFAULT '000',
    created_at TIMESTAMP DEFAULT NOW(),
    FOREIGN KEY(client_id) REFERENCES clients(id),
    FOREIGN KEY(carer_id) REFERENCES carers(id)
);




SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO'; 


ALTER TABLE shifts
     CHANGE shift_start
            shift_start TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00';




CREATE TABLE publicHolidays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    publicHolidayDate TIMESTAMP NOT NULL,
    publicHolidayDescription VARCHAR(255) NOT NULL DEFAULT 'Some Arb Holiday'
);

SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

ALTER TABLE publicHolidays
     CHANGE publicHolidayDate
            publicHolidayDate TIMESTAMP NOT NULL DEFAULT '0000-00-00 00:00:00';


INSERT INTO publicHolidays (publicHolidayDate, publicHolidayDescription ) values 

('2018-01-01',"New Year's Day"),
('2018-03-21',"Human Rights Day"),
('2018-03-30',"Good Friday"),
('2018-04-02',"Family Day"),
('2018-04-27',"Freedom Day"),
('2018-05-01',"Workers' Day"),
('2018-06-16',"Youth Day"),
('2018-08-09',"National Women's Day"),
('2018-09-24',"Heritage Day"),
('2018-12-16',"Day of Reconciliation"),
('2018-12-17',"Day of Reconciliation Holiday"),
('2018-12-25',"Christmas Day"),
('2018-12-26',"Day of Goodwill"),
('2019-01-01',"New Year's Day"),
('2019-03-21',"Human Rights Day"),
('2019-04-19',"Good Friday"),
('2019-04-22',"Family Day"),
('2019-04-27',"Freedom Day"),
('2019-05-01',"Workers' Day"),
('2019-06-16',"Youth Day"),
('2019-06-17',"Youth Day Holiday"),
('2019-08-09',"National Women's Day"),
('2019-09-24',"Heritage Day"),
('2019-12-16',"Day of Reconciliation"),
('2019-12-25',"Christmas Day"),
('2019-12-26',"Day of Goodwill");







alter table carers modify email varchar(150) NOT UNIQUE NOT NULL default 'no email';
-- DUPLICATE SHIFTS

SELECT 
    carer_id,carers.last_name,carers.first_name, COUNT(carer_id),
    client_id,clients.last_name,clients.first_name, COUNT(client_id),
    date(shift_start), count(date(shift_start))
     
FROM
    shifts
    inner join clients on clients.id = client_id
    inner join carers on carers.id = carer_id
    where shift_month = '2018-09'
    
GROUP BY 
    carer_id, client_id, date(shift_start)
HAVING 
       (COUNT(carer_id) > 1) AND 
       (COUNT(client_id) > 1) AND 
       (COUNT(date(shift_start)) > 1)


-- POSSIBLE OVERLAPS LONG SHIFTS

select carer_id, carers.last_name as carerLName, carers.first_name as carerFName,clients.last_name as clientLName, clients.first_name as clientFName, 
date(shift_end) ,time_format(timediff(shift_end,shift_start),'%H:%i'),
time_to_sec(timediff(shift_end, shift_start )) / 3600
 from shifts
 inner join carers on carers.id = carer_id
 inner join clients on clients.id = client_id
where shift_month = '2018-09' and ((time_to_sec(timediff(shift_end, shift_start )) / 3600) > 12)



-- SHIFTS LONGER THAN 24 HOURS
select  client_id, clients.last_name, clients.first_name, date(shift_start) ,
sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) as totalTime from shifts
join clients on shifts.client_id = clients.id
where shift_month = '2018-09'
group by  date(shift_start),client_id
having sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) > 24


-- CARERS WORKING EXCESIVELY LONG HOURS
select  carer_id , carers.last_name, carers.first_name,
sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) as totalTime
 from shifts
join carers on carers.id = carer_id
where shift_month = '2018-09'
group by  carer_id
having sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) > 195

-- OVERLAPPING SHIFTS REGARDLESS OF TIMES
select cl.last_name, cl.first_name,cl.id, ca.last_name, ca.first_name,ca.id,  a.shift_start, a.shift_end from shifts a 
inner join shifts b on a.client_id = b.client_id 
   and a.shift_end > b.shift_start and a.shift_start < b.shift_end
   and a.shift_start < b.shift_start
join clients  cl on a.client_id = cl.id
join carers  ca on a.carer_id = ca.id
where a.shift_month = '2018-09' and b.shift_month = '2018-09'


-- CARER EARNINGS
select  distinct carer_id, ca.last_name, ca.first_name,payrollCode, ct.client_type_description,
 case 
 when payrollCode = '100' || payrollCode = '200' || payrollCode = '300' || payrollCode = '400' || payrollCode = '500'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour
 when payrollCode = '101' || payrollCode = '202' || payrollCode = '303' || payrollCode = '404' || payrollCode = '505'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 1.1
 when payrollCode = '201'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 1.5
 when payrollCode = '203'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 1.5 * 1.1
 when payrollCode = '800'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 2
 when payrollCode = '801'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 2 * 1.1 end
from shifts
join carers ca on shifts.carer_id = ca.id
join clients cl on shifts.client_id = cl.id
join client_type ct on cl.client_type = ct.id
where shift_month = '2018-08'
group by  carer_id, ca.last_name, ca.first_name, payrollCode, cl.client_type


-- ALTERNATIVE
select  distinct carer_id, ca.last_name, ca.first_name,payrollCode, ct.client_type_description, ca.rate_per_hour,
if ((payrollCode = '100' || payrollCode = '200' || payrollCode = '300' || payrollCode = '400' || payrollCode = '500'),
sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour, 
if((payrollCode = '101' || payrollCode = '202' || payrollCode = '303' || payrollCode = '404' || payrollCode = '505'),
sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 1.1, 
if(payrollCode = '201',sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 1.5,
if(payrollCode = '203',sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 1.5 * 1.1,
if(payrollCode = '800',sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 2, 
if(payrollCode = '801',sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 2 * 1.1,0 ))))))
from shifts
join carers ca on shifts.carer_id = ca.id
join clients cl on shifts.client_id = cl.id
join client_type ct on cl.client_type = ct.id
where shift_month = '2018-08'
group by  carer_id, ca.last_name, ca.first_name, payrollCode, cl.client_type

-- WAGES BY CLIENT TYPE
select   ct.client_type_description,
 case 
 when payrollCode = '100' || payrollCode = '200' || payrollCode = '300' || payrollCode = '400' || payrollCode = '500'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour
 when payrollCode = '101' || payrollCode = '202' || payrollCode = '303' || payrollCode = '404' || payrollCode = '505'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 1.1
 when payrollCode = '201'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 1.5
 when payrollCode = '203'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 1.5 * 1.1
 when payrollCode = '800'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 2
 when payrollCode = '801'
 then sum(time_to_sec(timediff(shift_end, shift_start )) / 3600) * ca.rate_per_hour * 2 * 1.1 end
from shifts
join carers ca on shifts.carer_id = ca.id
join clients cl on shifts.client_id = cl.id
join client_type ct on cl.client_type = ct.id
where shift_month = '2018-08'
group by  payrollCode, carer_id, cl.client_type
order by ct.client_type_description


-- MONYHLY SUMMARY

select  ct.client_type_description,count(distinct client_id), sum(time_to_sec(timediff(shift_end, shift_start )) / 3600)
from shifts
join clients cl on cl.id = client_id
join client_type ct on cl.client_type = ct.id
where shift_month = '2018-08'
group by ct.client_type_description




select * from publicHolidays where DAYOFWEEK(publicHolidayDate) != 1 and MONTH(publicHolidayDate) = 9 and YEAR(publicHolidayDate) = 2018

upload the file somewhere with an API like: https://uploadcare.com/

-- SELECT table_schema AS 'Database', 
-- ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)' 
-- FROM information_schema.TABLES 
-- GROUP BY table_schema;



// const connection = mysql.createConnection({
//     host: 'localhost:3306',
//     user: 'eccentri_root',
//     database: 'eccentri_scheduler',
//     password: '12071994Wb!@',
//     multipleStatements: true //for more than one query in a get route
// });
// const connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     database: 'scheduler',
//     password: '12071994W!',
//     multipleStatements: true //for more than one query in a get route
// });