import React, { useState } from 'react';
import UserDetailTable from './UserDetailTable';
import { useTheme } from '../../context/ThemeContext';
import useUsersQuery from '../../hooks/user/useUsersQuery';

export default function AdminUsersPage() {
    const { mode } = useTheme();
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [pageSize, setPageSize] = useState(10);

    const {
        users,
        hasMore,
        isLoading,
        isFetching,
        pageIndex,
        goNext,
        goPrev,
        refetch,
        invalidate,
    } = useUsersQuery({ roleFilter, pageSize });

    const formatDate = (dateValue) => {
        if (!dateValue) return 'N/A';
        if (typeof dateValue.toDate === 'function') {
            return dateValue.toDate().toLocaleString();
        }
        return String(dateValue);
    };

    return (
        <div className='px-4 md:px-0 space-y-5'>
            <UserDetailTable
                mode={mode}
                user={users}
                loading={isLoading}
                isFetching={isFetching}
                roleFilter={roleFilter}
                setRoleFilter={setRoleFilter}
                pageIndex={pageIndex}
                hasMore={hasMore}
                onPrev={goPrev}
                onNext={goNext}
                onRefresh={refetch}
                invalidate={invalidate}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                formatDate={formatDate}
            />
        </div>
    );
}
