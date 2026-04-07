import React, { useEffect, useRef, useState } from "react";

const defaultDropdownStyle = {
  position: "absolute",
  top: "100%",
  left: 0,
  right: 0,
  marginTop: 6,
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  background: "#fff",
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.15)",
  zIndex: 1000,
  maxHeight: 220,
  overflowY: "auto",
  fontSize: 14,
  color: "#0f172a",
  padding: "6px 0",
};

const defaultInputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e5e7eb",
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  boxSizing: "border-box",
};

/**
 * A lightweight searchable dropdown that fetches suggestions as the user types.
 */
export default function SearchableSelect({
  value,
  displayValue = "",
  placeholder = "Nhập từ khóa...",
  disabled = false,
  inputClassName = "",
  inputStyle = {},
  containerStyle = {},
  dropdownStyle = {},
  helperText = "",
  noOptionsText = "Không có kết quả",
  clearable = true,
  onOptionSelect,
  fetchOptions,
  getOptionLabel,
  getOptionValue,
}) {
  const wrapperRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(displayValue || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fetchError, setFetchError] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  useEffect(() => {
    if (!isOpen) {
      setInputValue(displayValue || "");
    }
  }, [isOpen, displayValue]);

  useEffect(() => {
    if (disabled) {
      setIsOpen(false);
    }
  }, [disabled]);

  useEffect(() => {
    if (!isOpen || disabled) return undefined;
    let active = true;
    setIsLoading(true);
    setFetchError("");
    const handler = setTimeout(() => {
      Promise.resolve(fetchOptions?.(searchTerm || "") || [])
        .then((items) => {
          if (!active) return;
          setOptions(Array.isArray(items) ? items : []);
          setHighlightedIndex((prev) => {
            if (!Array.isArray(items) || items.length === 0) return -1;
            if (prev >= 0 && prev < items.length) return prev;
            return 0;
          });
        })
        .catch((err) => {
          console.error("SearchableSelect error", err);
          if (!active) return;
          setOptions([]);
          setFetchError("Không thể tải dữ liệu");
          setHighlightedIndex(-1);
        })
        .finally(() => {
          if (active) setIsLoading(false);
        });
    }, 250);
    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [isOpen, searchTerm, fetchOptions, disabled]);

  useEffect(() => {
    const resetList = () => setIsOpen(false);
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        resetList();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!Array.isArray(options)) return;
    const idx = options.findIndex((item) => {
      const optionValue = getOptionValue?.(item) ?? "";
      return String(optionValue) === String(value);
    });
    setHighlightedIndex(idx >= 0 ? idx : options.length ? 0 : -1);
  }, [options, value, getOptionValue]);

  const combinedInputStyle = {
    ...defaultInputStyle,
    ...inputStyle,
    paddingRight: clearable && value ? 36 : defaultInputStyle.padding,
    cursor: disabled ? "not-allowed" : "text",
    background: disabled ? "#f4f4f5" : "#fff",
  };

  const handleSelect = (option) => {
    if (!option) return;
    const label = getOptionLabel?.(option) || "";
    setInputValue(label);
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    onOptionSelect?.(option);
  };

  const handleClear = () => {
    setInputValue("");
    setSearchTerm("");
    setIsOpen(false);
    setHighlightedIndex(-1);
    onOptionSelect?.(null);
  };

  const handleKeyDown = (event) => {
    if (!isOpen) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((prev) =>
        Math.min((options?.length || 0) - 1, prev + 1)
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((prev) => Math.max(0, prev - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (
        highlightedIndex >= 0 &&
        highlightedIndex < (options?.length || 0)
      ) {
        handleSelect(options[highlightedIndex]);
      }
    } else if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: "relative", width: "100%", ...containerStyle }}
    >
      <input
        type="text"
        className={inputClassName}
        style={combinedInputStyle}
        placeholder={placeholder}
        value={inputValue}
        readOnly={disabled}
        onChange={(event) => {
          setInputValue(event.target.value);
          setSearchTerm(event.target.value);
          setIsOpen(true);
        }}
        onFocus={() => {
          if (!disabled) {
            setIsOpen(true);
            setSearchTerm("");
          }
        }}
        onKeyDown={handleKeyDown}
      />
      {clearable && value && !disabled && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Xóa lựa chọn"
          style={{
            position: "absolute",
            right: 10,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            fontSize: 16,
            cursor: "pointer",
            padding: 0,
            color: "#9ca3af",
          }}
        >
          ✕
        </button>
      )}
      {isOpen && !disabled && (
        <div style={{ ...defaultDropdownStyle, ...dropdownStyle }}>
          {isLoading ? (
            <div
              style={{
                padding: "8px 14px",
                color: "#6b7280",
              }}
            >
              Đang tìm...
            </div>
          ) : fetchError ? (
            <div
              style={{
                padding: "8px 14px",
                color: "#dc2626",
              }}
            >
              {fetchError}
            </div>
          ) : options.length === 0 ? (
            <div style={{ padding: "8px 14px", color: "#6b7280" }}>
              {noOptionsText}
            </div>
          ) : (
            options.map((option, index) => {
              const label = getOptionLabel?.(option) || "Không tên";
              const optionVal = getOptionValue?.(option);
              const isSelected = String(optionVal) === String(value);
              const isHighlighted = index === highlightedIndex;
              return (
                <button
                  type="button"
                  key={optionVal ?? `${label}-${index}`}
                  onClick={() => handleSelect(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    padding: "8px 14px",
                    border: "none",
                    background: isHighlighted
                      ? "#f3f4f6"
                      : isSelected
                      ? "#eef2ff"
                      : "transparent",
                    color: "#111827",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  {isSelected && (
                    <span style={{ color: "#2563eb", fontSize: 14 }}>✓</span>
                  )}
                  <span style={{ flex: 1 }}>{label}</span>
                </button>
              );
            })
          )}
        </div>
      )}
      {helperText && (
        <div
          style={{
            marginTop: 6,
            fontSize: 12,
            color: "#6b7280",
          }}
        >
          {helperText}
        </div>
      )}
    </div>
  );
}
