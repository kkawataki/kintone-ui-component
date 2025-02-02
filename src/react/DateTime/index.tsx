import '../../css/DateTime.css';
import '../../css/Text.css';
import React, {useState, createRef, useEffect, useMemo} from 'react';
import {en, ja, zh, format} from './components/Locale';
import {parseStringToDate, parseStringToTime} from './components/utils';
import Calendar from './components/Calendar';
import TimePicker from './components/TimePicker';
import Message from '../../constant/Message';

import '../../css/font.css';

type DateTimeConstructorParameters = {
  value?: Date;
  onChange?: (newDate: Date | null) => void;
  locale?: 'ja' | 'en' | 'zh';
  dateFormat?: string;
  type?: 'date' | 'time' | 'datetime';
  timeFormat?: string;
  isDisabled?: boolean;
  isVisible?: boolean;
}

const DateTime = ({
  value,
  isDisabled = false,
  isVisible = true,
  onChange,
  locale = 'ja',
  dateFormat = 'MM/dd/YYYY',
  type = 'datetime',
  timeFormat = 'HH:mm'}: DateTimeConstructorParameters) => {

  let localeObj = ja;
  if (locale === 'en') {
    localeObj = en;
  } else if (locale === 'zh') {
    localeObj = zh;
  }
  const validatedValue = useMemo(() => {
    if (!value) return new Date();
    if (!(value instanceof Date) || isNaN(value.getTime())) {
      throw new Error(Message.common.INVALID_ARGUMENT);
    }
    return value;
  }, [value]);
  const [defaultValue, setDefaultValue] = useState(validatedValue);
  const [pickerDisplay, setPickerDisplay] = useState('none');
  const [showPickerError, setShowPickerError] = useState(false);
  const [dateError, setDateError] = useState('');
  const [timePickerDisplay, setTimePickerDisplay] = useState('none');
  const [inputValue, setInputValue] = useState('');
  const [timeValue, setTimeValue] = useState(value === null ? '' : format(validatedValue, timeFormat));
  const [hasSelection, setHasSelection] = useState(value !== null);
  const [hasSelectionTime, setHasSelectionTime] = useState(value !== null);
  const [timeDateValue, setTimeDateValue] = useState(new Date(validatedValue));
  const [isDisableBtn, setDisableBtn] = useState(isDisabled);
  const [typeDateTime, setTypeDateTime] = useState(type);
  const wrapperRef: React.RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
  const calendarRef: React.RefObject<HTMLDivElement> = createRef<HTMLDivElement>();
  const timeRef: React.RefObject<HTMLDivElement> = createRef<HTMLDivElement>();

  useEffect(() => {
    setHasSelectionTime(value !== null);
    setHasSelection(value !== null);
  }, [value]);
  const _changeMinutesBy = (minutes: number, timeInput: HTMLInputElement) => {
    const newTime = new Date(timeDateValue);
    newTime.setSeconds(0);
    newTime.setMinutes(timeDateValue.getMinutes() + minutes);
    newTime.setMonth(timeDateValue.getMonth());
    newTime.setDate(timeDateValue.getDate());
    setTimeDateValue(newTime);
    onChange && onChange(newTime);
    setTimeout(()=>{
      setTimeValue(format(newTime, timeFormat));
      timeInput.setSelectionRange(3, 5);
    }, 1);
  };
  const _changeHoursBy = (hours: number, timeInput: HTMLInputElement) => {
    const newTime = new Date(timeDateValue);
    newTime.setSeconds(0);
    newTime.setHours(timeDateValue.getHours() + hours);
    newTime.setMonth(timeDateValue.getMonth());
    newTime.setDate(timeDateValue.getDate());
    setTimeDateValue(new Date(newTime));
    onChange && onChange(new Date(newTime));
    setTimeout(()=>{
      setTimeValue(format(newTime, timeFormat));
      timeInput.setSelectionRange(0, 2);
    }, 1);

  };
  const timeInputKeydownHandler = (e: React.KeyboardEvent) => {
    const timeTextInput = e.target as HTMLInputElement;
    switch (e.key) {
      case 'Tab':
        if (timeTextInput.selectionStart !== 3 && timeTextInput.selectionEnd !== 5) {
          e.preventDefault();
          setTimePickerDisplay('none');
          timeTextInput.setSelectionRange(3, 5);
        }
        break;
      case 'ArrowLeft':
      case 'Left':
        e.preventDefault();
        timeTextInput.setSelectionRange(0, 2);
        setTimePickerDisplay('none');
        break;
      case 'ArrowRight':
      case 'Right':
        e.preventDefault();
        timeTextInput.setSelectionRange(3, 5);
        setTimePickerDisplay('none');
        break;
      case 'ArrowUp':
      case 'Up':
        e.preventDefault();
        if (timeTextInput.selectionStart && timeTextInput.selectionEnd &&
          timeTextInput.selectionStart >= 2 && timeTextInput.selectionStart <= 5) {
          _changeMinutesBy(1, e.target as HTMLInputElement);
        } else {
          _changeHoursBy(1, e.target as HTMLInputElement);
        }
        setTimePickerDisplay('none');
        break;
      case 'ArrowDown':
      case 'Down':
        e.preventDefault();
        if (timeTextInput.selectionStart && timeTextInput.selectionEnd &&
          timeTextInput.selectionStart >= 2 && timeTextInput.selectionStart <= 5) {
          _changeMinutesBy(-1, e.target as HTMLInputElement);
        } else {
          _changeHoursBy(-1, e.target as HTMLInputElement);
        }
        setTimePickerDisplay('none');
        break;
      default:
        if (!/[0-9]/.test(e.key)) {
          e.preventDefault();
        }
        break;
    }
  };

  useEffect(()=>{
    if (defaultValue !== validatedValue) {
      setDefaultValue(validatedValue);
      setInputValue(format(validatedValue, dateFormat));
      setTimeValue(format(validatedValue, timeFormat));
      setTimeDateValue(new Date(validatedValue));
    } else {
      const newTimeDateValue = new Date(timeDateValue);
      let setNewTimeDateValue = false;
      if (validatedValue.getDate() !== timeDateValue.getDate()) {
        newTimeDateValue.setDate(validatedValue.getDate());
        setNewTimeDateValue = true;
      }
      if (validatedValue.getMonth() !== timeDateValue.getMonth()) {
        newTimeDateValue.setMonth(validatedValue.getMonth());
        setNewTimeDateValue = true;
      }
      if (validatedValue.getFullYear() !== timeDateValue.getFullYear()) {
        newTimeDateValue.setFullYear(validatedValue.getFullYear());
        setNewTimeDateValue = true;
      }
      if (setNewTimeDateValue && pickerDisplay === 'none') {
        setTimeDateValue(newTimeDateValue);
      }
      if (!hasSelection) {
        setInputValue('');
      } else if (inputValue !== dateFormat) {
        const newInputValue = format(validatedValue, dateFormat);
        if (newInputValue === dateFormat) {
          setInputValue(dateFormat);
          setDateError(Message.datetime.INVALID_DATE);
          setShowPickerError(true);
        } else if (!showPickerError) {
          setInputValue(newInputValue);
        }
      }
      if (typeof isDisabled !== 'boolean') {
        setDisableBtn(false);
      } else {
        setDisableBtn(isDisabled);
      }
    }
  }, [dateFormat, defaultValue, hasSelection, pickerDisplay, timeDateValue, timeFormat, validatedValue, isDisabled, inputValue, showPickerError]);

  if (typeDateTime !== 'datetime' && typeDateTime !== 'date' && typeDateTime !== 'time') {
    setTypeDateTime('datetime');
  }

  if (isVisible) {
    return (
      <div className="date-time-container" ref={wrapperRef}>
        {
          (typeDateTime === 'datetime' || typeDateTime === 'date') &&
          <div className="date-container">
            <div className="text-input-container" key={`${dateError}`}>
              <input
                type="text"
                className="kuc-input-text text-input"
                disabled={isDisableBtn}
                onFocus={(e) => {
                  // if (showPickerError) {
                  //   setHasSelection(false);
                  // }
                  if (showPickerError || !hasSelection) {
                    setPickerDisplay('block');
                    return;
                  }
                  const temporary = e.target.value ? new Date(parseStringToDate(e.target.value, dateFormat) as Date) : new Date();
                  const dateValue = e.target.value ? new Date(parseStringToDate(e.target.value, dateFormat) as Date) : new Date();
                  temporary.setSeconds(timeDateValue.getSeconds());
                  temporary.setMinutes(timeDateValue.getMinutes());
                  temporary.setHours(timeDateValue.getHours());
                  temporary.setDate(temporary.getDate() - 1);

                  dateValue.setSeconds(timeDateValue.getSeconds());
                  dateValue.setMinutes(timeDateValue.getMinutes());
                  dateValue.setHours(timeDateValue.getHours());

                  setTimeDateValue(temporary);
                  setTimeout(() => {
                    setPickerDisplay('block');
                    setTimePickerDisplay('none');
                    setTimeDateValue(dateValue);
                  }, 1);
                }}
                value={value !== null ? inputValue : ''}
                onBlur={(e) => {
                  const tempDate = parseStringToDate(e.target.value, dateFormat);
                  let returnDate: Date|null = null;
                  if (!e.target.value) {
                    setHasSelection(false);
                  } else if (tempDate instanceof Date && !isNaN(tempDate as any)) {
                    returnDate = new Date(validatedValue);
                    returnDate.setFullYear(tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate());
                    setShowPickerError(false);
                  } else if (e.target.value) {
                    setDateError(Message.datetime.INVALID_DATE);
                    setShowPickerError(true);
                  }

                  const relatedTarget = e.relatedTarget ||
                    (e as any).explicitOriginalTarget ||
                    document.activeElement; // IE11
                  const calendar = calendarRef.current as HTMLDivElement;
                  if (
                    relatedTarget !== calendar && !calendar.contains(relatedTarget as HTMLElement)
                  ) {
                    setPickerDisplay('none');
                    if (timeValue === '' || value === null) {
                      setHasSelectionTime(false);
                    }
                    if (returnDate) {
                      onChange && onChange(returnDate);
                      setShowPickerError(false);
                    }
                  }
                }}
                onKeyDown={
                  (e) => {
                    if (e.key === 'Tab') {
                      setPickerDisplay('none');
                    }
                  }
                }
                onChange={(e)=>{
                  setInputValue(e.target.value);
                }}
              />
            </div>
            {
              (dateError && showPickerError) &&
              <div className="label-error">
                <span>{dateError}</span>
              </div>
            }
            {
              !isDisableBtn &&
              <Calendar
                calRef={calendarRef}
                pickerDisplay={pickerDisplay}
                date={timeDateValue}
                locale={localeObj}
                hasSelection={hasSelection}
                onDateClick={
                  (calendarDate: Date | null, previousDate: Date | null) => {
                    let tempDate: Date;
                    if (previousDate) {
                      tempDate = new Date(previousDate);
                    } else {
                      tempDate = new Date();
                    }
                    if (calendarDate) {
                      if (validatedValue) {
                        tempDate = new Date(validatedValue);
                      }
                      tempDate.setFullYear(calendarDate.getFullYear(), calendarDate.getMonth(), calendarDate.getDate());
                      tempDate.setHours(timeDateValue.getHours());
                      tempDate.setMinutes(timeDateValue.getMinutes());
                      tempDate.setSeconds(0);
                      if (timeValue === '' || value === null) {
                        setHasSelectionTime(false);
                      }
                      onChange && onChange(tempDate);
                      setHasSelection(true);
                      setShowPickerError(false);
                    } else if (previousDate) {
                      onChange && onChange(null);
                      setInputValue('');
                      setShowPickerError(false);
                    }
                    setPickerDisplay('none');
                  }
                }
              />
            }
          </div>

        }
        {
          (typeDateTime === 'datetime' || typeDateTime === 'time') &&
          <div className="time-container">
            <input
              type="text"
              disabled={isDisableBtn}
              maxLength={5}
              key={1}
              className="kuc-input-text text-input time"
              onClick={(e) => {
                const timeTextInput = e.target as HTMLInputElement;
                if (timeTextInput.selectionStart &&
                  (timeTextInput.selectionStart >= 2 && timeTextInput.selectionStart <= 5)) {
                  timeTextInput.setSelectionRange(3, 5);
                } else {
                  timeTextInput.setSelectionRange(0, 2);
                }
                setTimePickerDisplay('flex');
                setPickerDisplay('none');
              }}
              onFocus={(e) => {
                const timeInput = e.target as HTMLInputElement;
                setTimeout(()=>{
                  timeInput.setSelectionRange(0, 2);
                  e.preventDefault();
                  e.stopPropagation();
                }, 1);
                setTimePickerDisplay('flex');
                setPickerDisplay('none');
              }}
              onBlur={
                (e)=>{
                  const relatedTarget = e.relatedTarget ||
                  (e as any).explicitOriginalTarget ||
                    document.activeElement; // IE11
                  const timePicker = timeRef.current as HTMLDivElement;
                  if (relatedTarget !== timePicker && !timePicker.contains(relatedTarget as HTMLElement)) {
                    setTimePickerDisplay('none');
                  }
                }
              }
              value={(value !== null) && hasSelectionTime ? timeValue : ''}
              onChange={(e)=>{
                const timeTextInput = e.target as HTMLInputElement;
                let newTime = parseStringToTime(timeTextInput.value);
                if (!newTime) {
                  newTime = new Date(timeDateValue);
                } else {
                  newTime.setDate(timeDateValue.getDate());
                  newTime.setMonth(timeDateValue.getMonth());
                  newTime.setFullYear(timeDateValue.getFullYear());
                }
                if (timeTextInput.selectionStart &&
                  timeTextInput.selectionStart >= 3 && timeTextInput.selectionStart <= 5) {
                  // minutes are being edited
                  let previousMinutes: string;
                  if (timeDateValue.getMinutes() > 10) {
                    previousMinutes = ('' + timeDateValue.getMinutes())[1];
                  } else {
                    previousMinutes = ('' + timeDateValue.getMinutes());
                  }
                  if (parseInt(previousMinutes, 10) > 5) {
                    previousMinutes = '0';
                  }
                  newTime.setMinutes(parseInt(previousMinutes + '' + newTime.getMinutes(), 10));
                  timeTextInput.value = format(newTime, 'HH:mm');
                  timeTextInput.setSelectionRange(3, 5);
                } else {
                  // hours are being edited
                  let previousHours: string;
                  if (timeDateValue.getHours() > 10) {
                    previousHours = ('' + timeDateValue.getHours())[1];
                  } else if (timeDateValue.getHours() === 10) {
                    previousHours = ('' + timeDateValue.getHours())[0];
                  } else {
                    previousHours = ('' + timeDateValue.getHours());
                  }
                  if (parseInt(previousHours, 10) > 2) {
                    previousHours = '0';
                  }
                  newTime.setHours(parseInt(previousHours + '' + newTime.getHours(), 10));
                  timeTextInput.value = format(newTime, 'HH:mm');
                  timeTextInput.setSelectionRange(0, 2);
                }
                newTime.setSeconds(0);
                newTime.setMonth(timeDateValue.getMonth());
                newTime.setDate(timeDateValue.getDate());
                setTimeValue(format(newTime, timeFormat));
                setTimeDateValue(new Date(newTime));
                onChange && onChange(new Date(newTime));
                setTimePickerDisplay('none');
              }}
              onKeyDown={
                (e) => {
                  timeInputKeydownHandler(e);
                }
              }
            />
            {
              !isDisableBtn &&
              <TimePicker
                timeRef={timeRef}
                pickerDisplay={timePickerDisplay}
                onTimeClick={
                  (timePickerDate: Date) => {
                    setHasSelectionTime(true);
                    let tempDate = new Date();
                    if (timeDateValue) tempDate = new Date(timeDateValue);
                    value && tempDate.setDate(value.getDate());
                    value && tempDate.setMonth(value.getMonth());
                    tempDate.setHours(timePickerDate.getHours(), timePickerDate.getMinutes());
                    tempDate.setSeconds(0);
                    onChange && onChange(tempDate);
                    setTimePickerDisplay('none');
                  }
                }
              />
            }
          </div>
        }
      </div>
    );
  }

  return <div />;
};

export default DateTime;
export {
  DateTimeConstructorParameters,
  Calendar
};
export {
  en,
  zh,
  ja,
  format,
  getSeperator,
  availableLocales
} from './components/Locale';
