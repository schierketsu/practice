-- Older SQLite builds treated json_array("university") as a literal ["university"] instead of the column value.
UPDATE "Company"
SET "universities" = json_array('ЧУВГУ ИМ. И. Н. УЛЬЯНОВА')
WHERE json_valid(CAST("universities" AS TEXT))
  AND json_array_length("universities") = 1
  AND lower(trim(json_extract("universities", '$[0]'))) = 'university';
