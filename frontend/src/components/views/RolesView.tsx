// @ts-nocheck
import React, { useEffect, useRef, useState } from 'react';

import { User } from 'lucide-react';

export default function RolesView() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-[#161a23]">
        <User className="w-16 h-16 text-[#ffffff10] mb-4" />
        <h2 className="text-xl text-gray-500 font-light uppercase tracking-widest">Access Roles</h2>
        <p className="text-sm text-gray-700 mt-2">Identity verification modules coming soon.</p>
    </div>
  );
}
