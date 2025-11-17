-- Reset Jeff and Joe's connection for testing
-- Updated for connection_flow table

-- Delete existing connection rows between Jeff and Joe
DELETE FROM connection_flow
WHERE (user_id = '4532c28c-24b5-4bc3-a3fc-515ca8e68571' AND matched_user_id = 'f4449484-dd7e-4451-be05-78909d0b0ea8')
   OR (user_id = 'f4449484-dd7e-4451-be05-78909d0b0ea8' AND matched_user_id = '4532c28c-24b5-4bc3-a3fc-515ca8e68571');

-- Verify deletion
SELECT
  user_id,
  matched_user_id,
  status,
  initiated_by_user_id,
  pending_since,
  created_at
FROM connection_flow
WHERE (user_id = '4532c28c-24b5-4bc3-a3fc-515ca8e68571' AND matched_user_id = 'f4449484-dd7e-4451-be05-78909d0b0ea8')
   OR (user_id = 'f4449484-dd7e-4451-be05-78909d0b0ea8' AND matched_user_id = '4532c28c-24b5-4bc3-a3fc-515ca8e68571');

-- Should return 0 rows if deletion was successful
