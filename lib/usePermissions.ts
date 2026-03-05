import { useState, useCallback, useEffect } from "react";
import {
  checkPermissionStatus,
  requestPermission,
  requestPermissionWithAlert,
  PermissionType,
  PermissionStatus,
} from "./permissions";

interface UsePermissionsOptions {
  onGranted?: () => void;
  onDenied?: () => void;
  showAlert?: boolean;
  alertMessage?: string;
}

interface UsePermissionsReturn {
  status: PermissionStatus;
  granted: boolean;
  requesting: boolean;
  request: () => Promise<boolean>;
  requestWithAlert: () => Promise<boolean>;
  checkStatus: () => Promise<void>;
}

/**
 * Hook to manage a single permission type
 * Automatically checks status on mount
 */
export function usePermission(
  type: PermissionType,
  options: UsePermissionsOptions = {}
): UsePermissionsReturn {
  const [status, setStatus] = useState<PermissionStatus>("undetermined");
  const [requesting, setRequesting] = useState(false);

  const checkStatus = useCallback(async () => {
    const currentStatus = await checkPermissionStatus(type);
    setStatus(currentStatus);
  }, [type]);

  // Check permission status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const request = useCallback(async (): Promise<boolean> => {
    setRequesting(true);
    try {
      const result = await requestPermission(type);
      setStatus(result.status);

      if (result.granted && options.onGranted) {
        options.onGranted();
      } else if (!result.granted && options.onDenied) {
        options.onDenied();
      }

      return result.granted;
    } finally {
      setRequesting(false);
    }
  }, [type, options]);

  const requestWithAlert = useCallback(async (): Promise<boolean> => {
    setRequesting(true);
    try {
      const granted = await requestPermissionWithAlert(type, options.alertMessage);

      if (granted && options.onGranted) {
        options.onGranted();
      } else if (!granted && options.onDenied) {
        options.onDenied();
      }

      const currentStatus = await checkPermissionStatus(type);
      setStatus(currentStatus);

      return granted;
    } finally {
      setRequesting(false);
    }
  }, [type, options]);

  return {
    status,
    granted: status === "granted",
    requesting,
    request,
    requestWithAlert,
    checkStatus,
  };
}

interface UseMultiplePermissionsOptions {
  onAllGranted?: () => void;
  onAnyDenied?: () => void;
  showAlert?: boolean;
  alertMessage?: string;
}

interface UseMultiplePermissionsReturn {
  statuses: Record<PermissionType, PermissionStatus>;
  allGranted: boolean;
  anyDenied: boolean;
  requesting: boolean;
  requestAll: () => Promise<boolean>;
  requestAllWithAlert: () => Promise<boolean>;
  checkAllStatuses: () => Promise<void>;
}

/**
 * Hook to manage multiple permissions at once
 */
export function usePermissions(
  types: PermissionType[],
  options: UseMultiplePermissionsOptions = {}
): UseMultiplePermissionsReturn {
  const [statuses, setStatuses] = useState<Record<PermissionType, PermissionStatus>>(
    types.reduce((acc, type) => ({ ...acc, [type]: "undetermined" }), {})
  );
  const [requesting, setRequesting] = useState(false);

  const checkAllStatuses = useCallback(async () => {
    const newStatuses: Record<PermissionType, PermissionStatus> = {};
    for (const type of types) {
      newStatuses[type] = await checkPermissionStatus(type);
    }
    setStatuses(newStatuses);
  }, [types]);

  // Check permissions on mount
  useEffect(() => {
    checkAllStatuses();
  }, [checkAllStatuses]);

  const requestAll = useCallback(async (): Promise<boolean> => {
    setRequesting(true);
    try {
      const results: Record<PermissionType, boolean> = {};
      for (const type of types) {
        const result = await requestPermission(type);
        results[type] = result.granted;
      }

      await checkAllStatuses();

      const allGranted = Object.values(results).every((granted) => granted);

      if (allGranted && options.onAllGranted) {
        options.onAllGranted();
      } else if (Object.values(results).some((granted) => !granted) && options.onAnyDenied) {
        options.onAnyDenied();
      }

      return allGranted;
    } finally {
      setRequesting(false);
    }
  }, [types, options, checkAllStatuses]);

  const requestAllWithAlert = useCallback(async (): Promise<boolean> => {
    setRequesting(true);
    try {
      const results: Record<PermissionType, boolean> = {};
      for (const type of types) {
        const granted = await requestPermissionWithAlert(type, options.alertMessage);
        results[type] = granted;
      }

      await checkAllStatuses();

      const allGranted = Object.values(results).every((granted) => granted);

      if (allGranted && options.onAllGranted) {
        options.onAllGranted();
      } else if (Object.values(results).some((granted) => !granted) && options.onAnyDenied) {
        options.onAnyDenied();
      }

      return allGranted;
    } finally {
      setRequesting(false);
    }
  }, [types, options, checkAllStatuses]);

  const allGranted = Object.values(statuses).every((status) => status === "granted");
  const anyDenied = Object.values(statuses).some((status) => status === "denied");

  return {
    statuses,
    allGranted,
    anyDenied,
    requesting,
    requestAll,
    requestAllWithAlert,
    checkAllStatuses,
  };
}
